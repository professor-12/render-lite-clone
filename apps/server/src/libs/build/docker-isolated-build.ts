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

  // `corepack enable` symlinks into /usr/local/bin and fails with EACCES when Docker runs as
  // `--user` (non-root). Install CLIs under /tmp with `npm --prefix` instead (writable by any UID).
  if (buildLanguage === 'javascript') {
    lines.push(
      'export RENDERLITE_TOOL_ROOT="${RENDERLITE_TOOL_ROOT:-/tmp/renderlite-js-tools}"',
      'mkdir -p "$RENDERLITE_TOOL_ROOT"',
      'export PATH="$RENDERLITE_TOOL_ROOT/bin:$PATH"',
      'if ! command -v pnpm >/dev/null 2>&1; then',
      '  npm install -g pnpm@9 --prefix="$RENDERLITE_TOOL_ROOT"',
      'fi',
      'if ! command -v yarn >/dev/null 2>&1; then',
      '  npm install -g yarn@1.22.22 --prefix="$RENDERLITE_TOOL_ROOT"',
      'fi',
    );
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
