import { spawn } from 'node:child_process';

/**
 * Run a docker CLI command, capture stdout (returned), and forward both streams via callbacks.
 * Throws if the process exits non-zero.
 */
export async function runDocker({
  args,
  onStdout,
  onStderr,
}: {
  args: string[];
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdoutBuf = '';
    let stderrBuf = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d: string) => {
      stdoutBuf += d;
      onStdout?.(d);
    });
    child.stderr.on('data', (d: string) => {
      stderrBuf += d;
      onStderr?.(d);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve(stdoutBuf);
      reject(new Error(`docker ${args[0]} failed (${code}): ${stderrBuf.trim() || stdoutBuf.trim()}`));
    });
  });
}

/** Load a docker image tar and return the loaded image reference. */
export async function loadDockerImageFromTar({
  tarPath,
  onStdout,
  onStderr,
}: {
  tarPath: string;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}): Promise<string> {
  const out = await runDocker({
    args: ['load', '-i', tarPath],
    onStdout,
    onStderr,
  });
  // Output lines look like "Loaded image: app:latest" or "Loaded image ID: sha256:..."
  const match = out.match(/Loaded image(?: ID)?:\s*(\S+)/);
  if (!match) {
    throw new Error(`Could not determine loaded image reference from docker load output:\n${out}`);
  }
  return match[1];
}

/** Stop and remove any container with this name (idempotent — no-op if missing). */
export async function stopAndRemoveContainer(name: string): Promise<void> {
  // We don't fail on absence — capture stderr but do not throw.
  await new Promise<void>((resolve) => {
    const child = spawn('docker', ['rm', '-f', name], { stdio: 'ignore' });
    child.on('error', () => resolve());
    child.on('close', () => resolve());
  });
}

export type RunContainerResult = {
  containerId: string;
  hostPort: number | null;
};

export async function runDetachedContainer({
  name,
  image,
  containerPort,
  env,
  command,
  workdir,
  binds,
  onStdout,
  onStderr,
}: {
  name: string;
  image: string;
  containerPort: number;
  env: string[];
  /** Optional shell command override (used when running a zip artifact via a base runtime image). */
  command?: string;
  workdir?: string;
  /** Extra host:container bind mounts. */
  binds?: Array<{ host: string; container: string; readOnly?: boolean }>;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}): Promise<RunContainerResult> {
  const args: string[] = ['run', '-d', '--name', name, '--restart', 'unless-stopped'];

  args.push('-p', `${containerPort}`); // Publish to a random host port; query with `docker port`.

  for (const kv of env) {
    if (!kv || !kv.includes('=')) continue;
    args.push('-e', kv);
  }

  if (workdir) args.push('-w', workdir);
  if (binds) {
    for (const b of binds) {
      args.push('-v', `${b.host}:${b.container}${b.readOnly ? ':ro' : ''}`);
    }
  }

  args.push(image);

  if (command) {
    args.push('sh', '-lc', command);
  }

  const stdout = await runDocker({ args, onStdout, onStderr });
  const containerId = stdout.trim().split('\n').pop()?.trim() ?? '';
  if (!containerId) throw new Error('docker run did not return a container id');

  // Resolve the host port assigned to the container's published containerPort.
  let hostPort: number | null = null;
  try {
    const portOut = await runDocker({ args: ['port', containerId, `${containerPort}/tcp`] });
    // Output: "0.0.0.0:32768" (possibly multiple lines for IPv4/IPv6).
    const portLine = portOut
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    const m = portLine?.match(/:(\d+)$/);
    if (m) hostPort = Number(m[1]);
  } catch (err) {
    onStderr?.(`Could not read host port for ${containerPort}: ${err instanceof Error ? err.message : String(err)}\n`);
  }

  return { containerId, hostPort };
}

/** Inspect whether the container is currently running. */
export async function isContainerRunning(name: string): Promise<boolean> {
  try {
    const out = await runDocker({ args: ['inspect', '-f', '{{.State.Running}}', name] });
    return out.trim() === 'true';
  } catch {
    return false;
  }
}

/** Capture recent container logs (last N lines). */
export async function captureContainerLogs(name: string, tail = 200): Promise<string> {
  try {
    return await runDocker({ args: ['logs', '--tail', String(tail), name] });
  } catch (err) {
    return `Could not read logs for ${name}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
