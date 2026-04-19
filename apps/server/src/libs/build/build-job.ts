import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { uploadRawFileToCloudinary } from '../media/cloudinary-uploader';
import { zipDirectory } from './archive';
import { shallowCloneGithubRepo } from './clone-github';
import { runShellCommand } from './run-command';

function sanitizeOutDir(outDir?: string) {
  const v = outDir?.trim();
  if (!v) return null;
  // Keep it simple: don't allow absolute paths or traversal.
  if (v.startsWith('/') || v.includes('..')) return null;
  return v;
}

function inferDockerImageTag(buildCommand: string) {
  // Supports: docker build -t tag ., docker build --tag tag .
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
  artifactKind: 'zip' | 'docker-image-tar';
};

export async function runBuildJobAndUpload({
  githubUrl,
  branch,
  installCommand,
  buildCommand,
  outDir,
  onStdout,
  onStderr,
}: {
  githubUrl: string;
  branch?: string;
  installCommand: string;
  buildCommand: string;
  outDir?: string;
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

    const isDockerBuild = /^\s*docker\s+build\b/i.test(buildCommand);

    if (installCommand.trim()) {
      onStdout?.(`\n$ ${installCommand}\n`);
      await runShellCommand({ command: installCommand, cwd: repoDir, onStdout, onStderr });
    }

    if (buildCommand.trim()) {
      onStdout?.(`\n$ ${buildCommand}\n`);
      await runShellCommand({ command: buildCommand, cwd: repoDir, onStdout, onStderr });
    }

    if (isDockerBuild) {
      const tag = inferDockerImageTag(buildCommand);
      const outFile = path.join(artifactDir, `${tag.replace(/[^\w.-]+/g, '_')}.tar`);
      const saveCmd = `docker save ${tag} -o ${JSON.stringify(outFile)}`;
      onStdout?.(`\n$ ${saveCmd}\n`);
      await runShellCommand({ command: saveCmd, cwd: repoDir, onStdout, onStderr });

      const publicId = `docker-image-${randomUUID()}`;
      const uploaded = await uploadRawFileToCloudinary({ filePath: outFile, publicId });
      return {
        artifactUrl: uploaded.url,
        artifactPublicId: uploaded.publicId,
        artifactKind: 'docker-image-tar',
      };
    }

    const safeOutDir = sanitizeOutDir(outDir);
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
    onStdout?.(`\nPackaging ${path.relative(repoDir, directoryToZip) || '.'}...\n`);
    await zipDirectory({ sourceDir: directoryToZip, outFile: zipFile });

    const publicId = `build-${randomUUID()}`;
    const uploaded = await uploadRawFileToCloudinary({ filePath: zipFile, publicId });
    return {
      artifactUrl: uploaded.url,
      artifactPublicId: uploaded.publicId,
      artifactKind: 'zip',
    };
  } finally {
    // best-effort cleanup
    await fs.rm(workRoot, { recursive: true, force: true }).catch(() => undefined);
  }
}

