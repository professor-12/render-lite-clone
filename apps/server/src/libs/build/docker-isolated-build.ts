import fs from 'node:fs/promises';
import path from 'node:path';
import { runShellCommand } from './run-command';
import { bashSingleQuote, sanitizeRelativeDir } from './sanitize-relative-dir';
import type { BuildLanguage } from './build-language';
import { resolveBuildImageForLanguage } from './build-language';

/**
 * Runs install + build inside a disposable container with the repo mounted at /workspace.
 * Requires Docker CLI available to the worker process.
 */
export async function runInstallAndBuildInDocker(opts: {
  buildLanguage: BuildLanguage;
  hostRepoDirAbs: string;
  workRoot: string;
  rootDir?: string | null;
  installCommand: string;
  buildCommand: string;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}): Promise<void> {
  const { buildLanguage, hostRepoDirAbs, workRoot, rootDir, installCommand, buildCommand, onStdout, onStderr } =
    opts;

  const image = resolveBuildImageForLanguage(buildLanguage);
  if (!image) {
    throw new Error(`No Docker image configured for build language: ${buildLanguage}`);
  }

  const scriptPath = path.join(workRoot, 'renderlite-docker-build.sh');
  const safeRoot = sanitizeRelativeDir(rootDir);

  const lines = ['#!/usr/bin/env bash', 'set -euo pipefail', 'set -x', 'cd /workspace'];
  if (safeRoot) {
    lines.push(`cd ${bashSingleQuote(safeRoot)}`);
  }

  if (installCommand.trim()) {
    lines.push(installCommand.trim());
  }
  if (buildCommand.trim()) {
    lines.push(buildCommand.trim());
  }

  await fs.writeFile(scriptPath, `${lines.join('\n')}\n`, { mode: 0o755 });

  const uid = typeof process.getuid === 'function' ? process.getuid() : undefined;
  const gid = typeof process.getgid === 'function' ? process.getgid() : undefined;
  const userFlag = uid !== undefined && gid !== undefined ? `--user ${uid}:${gid}` : '';

  onStdout?.(`\n[renderlite] Running build in Docker image: ${image}\n`);

  const cmd = [
    'docker',
    'run',
    '--rm',
    userFlag,
    '-v',
    `${JSON.stringify(hostRepoDirAbs)}:/workspace:rw`,
    '-v',
    `${JSON.stringify(scriptPath)}:/renderlite/build.sh:ro`,
    '-w',
    '/workspace',
    image,
    'bash',
    '/renderlite/build.sh',
  ].join(' ');

  await runShellCommand({ command: cmd, cwd: workRoot, onStdout, onStderr });
}
