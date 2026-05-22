import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { uploadFileToCloudflareR2, uploadRawFileToCloudinary } from '../media/cloudinary-uploader';
import type { BuildLanguage } from './build-language';
import { zipDirectory } from './archive';
import { shallowCloneGithubRepo } from './clone-github';
import { runShellCommand } from './run-command';
import { runInstallAndBuildInDocker } from './docker-isolated-build';
import { sanitizeRelativeDir } from './sanitize-relative-dir';

function inferDockerImageTag(buildCommand: string) {
  const parts = buildCommand.split(/\s+/).filter(Boolean);
  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i];
    if (p === '-t' || p === '--tag') {
      const next = parts[i + 1];
      if (next) return next;
    }
  }
  return 'app';
}

export type BuildJobResult = {
  artifactUrl: string;
  artifactPublicId: string;
  artifactKey: string;
  artifactKind: 'zip' | 'docker-image-tar';
};

export async function runBuildJobAndUpload({
  githubUrl,
  branch,
  rootDir,
  installCommand,
  buildCommand,
  outDir,
  buildLanguage,
  onStdout,
  onStderr,
}: {
  githubUrl: string;
  branch?: string;
  rootDir?: string | null;
  installCommand: string;
  buildCommand: string;
  outDir?: string;
  buildLanguage: BuildLanguage;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}): Promise<BuildJobResult> {
  const workRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'renderlite-build-'));
  const repoDir = path.join(workRoot, 'repo');
  const artifactDir = path.join(workRoot, 'artifact');
  await fs.mkdir(repoDir, { recursive: true });
  await fs.mkdir(artifactDir, { recursive: true });

  try {
    onStdout?.(`Cloning ${githubUrl}...\n`);
    await shallowCloneGithubRepo({ githubUrl, branch, targetDir: repoDir });
    onStdout?.('Clone complete.\n');

    const isDockerfileBuild =
      buildLanguage === 'docker' || /^\s*docker\s+build\b/i.test(buildCommand);

    // This is if the user is using a Dockerfile and wants us to build the image for them. We run the install and build commands on the host since it's expected that the user is using a Dockerfile and has docker installed locally. In this case, we also support pushing the built image to a registry as part of the build command, and then we save the built image to a tarball and upload it to R2 for the deploy step to consume. This is because Docker images can be large and may exceed Cloudinary's limits.
    if (isDockerfileBuild) {
      if (installCommand.trim()) {
        onStdout?.(`\n$ ${installCommand}\n`);
        await runShellCommand({ command: installCommand, cwd: repoDir, onStdout, onStderr });
      }
      if (buildCommand.trim()) {
        onStdout?.(`\n$ ${buildCommand}\n`);
        await runShellCommand({ command: buildCommand, cwd: repoDir, onStdout, onStderr });
      }

      const tag = inferDockerImageTag(buildCommand);
      const outFile = path.join(artifactDir, `${tag.replace(/[^\w.-]+/g, '_')}.tar`);
      const saveCmd = `docker save ${tag} -o ${JSON.stringify(outFile)}`;
      onStdout?.(`\n$ ${saveCmd}\n`);
      await runShellCommand({ command: saveCmd, cwd: repoDir, onStdout, onStderr });

      const publicId = `docker-image-${randomUUID()}`;

      onStdout?.(`Uploading ${outFile}...\n`);
      const uploaded = await uploadFileToCloudflareR2({
        filePath: outFile,
        publicId,
        onLog: onStdout,
      });
      return {
        artifactUrl: uploaded.url,
        artifactPublicId: uploaded.publicId,
        artifactKey: `renderlite/builds/${publicId}.tar`,
        artifactKind: 'docker-image-tar',
      };
    }

    await runInstallAndBuildInDocker({
      buildLanguage,
      hostRepoDirAbs: path.resolve(repoDir),
      workRoot,
      rootDir,
      installCommand,
      buildCommand,
      onStdout,
      onStderr,
    });

    const safeOutDir = sanitizeRelativeDir(outDir);
    const buildOutputDir = safeOutDir ? path.join(repoDir, safeOutDir) : null;
    let directoryToZip = repoDir;

    if (buildOutputDir) {
      try {
        const stat = await fs.stat(buildOutputDir);
        if (stat.isDirectory()) {
          directoryToZip = buildOutputDir;
        } else {
          onStderr?.(`outDir exists but is not a directory: ${safeOutDir}\n`);
        }
      } catch {
        onStderr?.(`outDir not found, zipping repo instead: ${safeOutDir}\n`);
      }
    }

    const zipFile = path.join(artifactDir, 'build.zip');
    const zippingWholeRepo = directoryToZip === repoDir;
    onStdout?.(
      `\nPackaging ${path.relative(repoDir, directoryToZip) || '.'}${zippingWholeRepo ? ' (excluding .git, node_modules, .pnpm)' : ''
      }...\n`,
    );
    await zipDirectory({
      sourceDir: directoryToZip,
      outFile: zipFile,
      excludeHeavyDirs: zippingWholeRepo,
    });

    const publicId = `build-${randomUUID()}`;
    const uploaded = await uploadFileToCloudflareR2({
      filePath: zipFile,
      publicId,
      onLog: onStdout,
    });
    return {
      artifactUrl: uploaded.url,
      artifactPublicId: uploaded.publicId,
      artifactKey: `renderlite/builds/${publicId}.zip`,
      artifactKind: 'zip',
    };
  } finally {
    await fs.rm(workRoot, { recursive: true, force: true }).catch(() => undefined);
  }
}
