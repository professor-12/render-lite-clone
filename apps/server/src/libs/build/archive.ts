import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';

/** Always skipped: VCS metadata is never useful in a deploy artifact. */
const ALWAYS_SKIP = ['**/.git'];
/** Additionally skipped when excludeHeavyDirs is set (static sites carry no deps). */
const HEAVY_DIR_SKIP = ['**/node_modules', '**/.pnpm'];

export async function zipDirectory({
  sourceDir,
  outFile,
  /**
   * When true, also skip node_modules / .pnpm. Use for static publish dirs (no deps needed).
   * Leave false for dynamic apps so the start command can boot against bundled dependencies.
   */
  excludeHeavyDirs,
}: {
  sourceDir: string;
  outFile: string;
  excludeHeavyDirs?: boolean;
}) {
  await new Promise<void>((resolve, reject) => {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const output = fs.createWriteStream(outFile);
    // Level 6: much faster than 9 on large trees with little size difference for deploy zips.
    const archive = archiver('zip', { zlib: { level: 6 } });

    output.on('close', () => resolve());
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    const skip = excludeHeavyDirs ? [...ALWAYS_SKIP, ...HEAVY_DIR_SKIP] : ALWAYS_SKIP;
    archive.glob(
      '**/*',
      {
        cwd: sourceDir,
        dot: true,
        skip,
      },
      {},
    );
    archive.finalize().catch(reject);
  });
}

