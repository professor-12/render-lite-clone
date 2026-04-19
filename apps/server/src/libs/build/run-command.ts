import { spawn } from 'node:child_process';

export type CommandOutputHandler = (chunk: string) => void;

export async function runShellCommand({
  command,
  cwd,
  env,
  onStdout,
  onStderr,
}: {
  command: string;
  cwd: string;
  env?: NodeJS.ProcessEnv;
  onStdout?: CommandOutputHandler;
  onStderr?: CommandOutputHandler;
}) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env: { ...process.env, ...env },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (d: string) => onStdout?.(d));
    child.stderr.on('data', (d: string) => onStderr?.(d));

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Command failed (${code}): ${command}`));
    });
  });
}

