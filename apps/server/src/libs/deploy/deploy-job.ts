import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { resolveBuildImageForLanguage, type BuildLanguage } from '../build/build-language';
import { sanitizeRelativeDir } from '../build/sanitize-relative-dir';
import type { ProjectType } from '../../workers/contracts';
import { downloadArtifact } from './download-artifact';
import {
  captureContainerLogs,
  isContainerRunning,
  loadDockerImageFromTar,
  runDetachedContainer,
  stopAndRemoveContainer,
} from './docker-runtime';

export type DeployJobInput = {
  /** Stable identifier used as the container name (one running container per project). */
  projectId: string;
  deploymentId: string;
  artifactUrl: string;
  artifactKey?: string;
  artifactKind: 'zip' | 'docker-image-tar';
  buildLanguage: BuildLanguage;
  projectType: ProjectType;
  startCommand: string;
  rootDir?: string | null;
  outDir?: string | null;
  containerPort: number;
  env: string[];
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
};

export type DeployJobResult = {
  containerName: string;
  containerId: string;
  hostPort: number | null;
  image: string;
};

function safeContainerName(projectId: string): string {
  // Docker container names: [a-zA-Z0-9][a-zA-Z0-9_.-]+
  const sanitized = projectId.replace(/[^a-zA-Z0-9_.-]/g, '-').slice(0, 50);
  return `renderlite-${sanitized || 'app'}`;
}

async function extractZip({
  zipPath,
  destDir,
  onStdout,
  onStderr,
}: {
  zipPath: string;
  destDir: string;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}): Promise<void> {
  await fs.mkdir(destDir, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn('unzip', ['-q', '-o', zipPath, '-d', destDir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d: string) => onStdout?.(d));
    child.stderr.on('data', (d: string) => onStderr?.(d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`unzip failed (${code}) for ${zipPath}`));
    });
  });
}

/**
 * End-to-end deploy: download artifact, run it in a fresh container (replacing any previous
 * running container for the same project), return the runtime info.
 *
 * Two artifact paths:
 *   - docker-image-tar: `docker load` then `docker run` the loaded image.
 *   - zip: extract on the host, mount into a base runtime image, run `startCommand` inside.
 */
export async function deployArtifact(input: DeployJobInput): Promise<DeployJobResult> {
  const {
    projectId,
    artifactUrl,
    artifactKey,
    artifactKind,
    buildLanguage,
    projectType,
    startCommand,
    rootDir,
    outDir,
    containerPort,
    env,
    onStdout,
    onStderr,
  } = input;

  const workRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'renderlite-deploy-'));
  const artifactPath = path.join(
    workRoot,
    artifactKind === 'docker-image-tar' ? 'image.tar' : 'build.zip',
  );
  const containerName = safeContainerName(projectId);

  try {
    onStdout?.(`Downloading artifact for deployment...\n`);
    await downloadArtifact({ url: artifactUrl, explicitKey: artifactKey, destPath: artifactPath, onLog: onStdout });
    onStdout?.(`Artifact downloaded.\n`);
    onStdout?.(`Stopping previous container ${containerName} (if any)...\n`);
    await stopAndRemoveContainer(containerName);

    let imageRef: string;
    let workdir: string | undefined;
    let binds: Array<{ host: string; container: string; readOnly?: boolean }> | undefined;
    let commandOverride: string | undefined;

    if (projectType === 'static') {
      throw new Error('Static projects are served in-process and should not reach the deploy worker');
    }

    if (artifactKind === 'docker-image-tar') {
      onStdout?.(`Loading docker image from tar...\n`);
      imageRef = await loadDockerImageFromTar({ tarPath: artifactPath, onStdout, onStderr });
      onStdout?.(`Loaded image: ${imageRef}\n`);
    } else {
      const extractDir = path.join(workRoot, 'extracted');
      onStdout?.(`Extracting build artifact...\n`);
      await extractZip({ zipPath: artifactPath, destDir: extractDir, onStdout, onStderr });

      const runtimeImage = resolveBuildImageForLanguage(buildLanguage);
      if (!runtimeImage) {
        throw new Error(`No runtime image available for build language: ${buildLanguage}`);
      }
      imageRef = runtimeImage;


      const safeRoot = sanitizeRelativeDir(rootDir);
      const safeOut = sanitizeRelativeDir(outDir);
      // If outDir was provided, the zip is *already* that directory's contents.
      // If not, rootDir applies to navigate within the full repo.
      const cwdInside = safeOut ? '/workspace' : safeRoot ? `/workspace/${safeRoot}` : '/workspace';
      workdir = cwdInside;
      binds = [{ host: path.resolve(extractDir), container: '/workspace', readOnly: false }];
      commandOverride = startCommand.trim() || 'tail -f /dev/null';
    }

    onStdout?.(`Starting container ${containerName} (image=${imageRef}, port=${containerPort})...\n`);
    const { containerId, hostPort } = await runDetachedContainer({
      name: containerName,
      image: imageRef,
      containerPort,
      env,
      workdir,
      binds,
      command: commandOverride,
      onStdout,
      onStderr,
    });

    // Brief liveness check so we can fail fast if the container exits immediately.
    await new Promise((r) => setTimeout(r, 1500));
    const running = await isContainerRunning(containerName);
    if (!running) {
      const logs = await captureContainerLogs(containerName, 200);
      onStderr?.(`Container exited shortly after start. Recent logs:\n${logs}\n`);
      throw new Error('Container exited immediately after start');
    }

    onStdout?.(
      `Deployed 🚀  container=${containerName} id=${containerId.slice(0, 12)} hostPort=${hostPort ?? 'unknown'}\n`,
    );

    return { containerName, containerId, hostPort, image: imageRef };
  } finally {
    await fs.rm(workRoot, { recursive: true, force: true }).catch(() => undefined);
  }
}
