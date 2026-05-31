import type { FileSet } from './file-set';
import type { PackageInfo } from './package-json';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

type PackageManagerCommands = {
  install: string;
  run: (script: string) => string;
  start: string;
};

export const PM_COMMANDS: Record<PackageManager, PackageManagerCommands> = {
  npm: { install: 'npm install', run: (s) => `npm run ${s}`, start: 'npm start' },
  pnpm: { install: 'pnpm install', run: (s) => `pnpm run ${s}`, start: 'pnpm start' },
  // `yarn <script>` and `yarn start` are the idiomatic forms.
  yarn: { install: 'yarn install', run: (s) => `yarn ${s}`, start: 'yarn start' },
  bun: { install: 'bun install', run: (s) => `bun run ${s}`, start: 'bun start' },
};

/** Lockfiles in priority order — the first one present wins. */
const PM_LOCKFILES: ReadonlyArray<readonly [string, PackageManager]> = [
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun'],
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
];

const KNOWN_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

/**
 * Resolve the package manager, most reliable signal first:
 *   1. the corepack `packageManager` field (e.g. "pnpm@9.1.0")
 *   2. a lockfile at the repo root
 *   3. npm as the universal default
 */
export function detectPackageManager(
  files: FileSet,
  pkg: PackageInfo,
  reason: string[],
): PackageManager {
  const declared = pkg.packageManager?.split('@')[0]?.trim().toLowerCase();
  if (declared && (KNOWN_MANAGERS as string[]).includes(declared)) {
    reason.push(`Package manager: ${declared} (packageManager field)`);
    return declared as PackageManager;
  }

  for (const [lockfile, pm] of PM_LOCKFILES) {
    if (files.has(lockfile)) {
      reason.push(`Package manager: ${pm} (${lockfile})`);
      return pm;
    }
  }

  reason.push('Package manager: npm (default)');
  return 'npm';
}
