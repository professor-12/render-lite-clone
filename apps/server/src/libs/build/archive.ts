import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';

/** Skip walking into these paths (minimatch on paths relative to sourceDir). */
const HEAVY_DIR_SKIP = ['**/.git', '**/node_modules', '**/.pnpm'];

export async function zipDirectory({
  sourceDir,
  outFile,
  /** When true, do not descend into .git / node_modules / .pnpm (full-repo fallback only). */
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
    if (excludeHeavyDirs) {
      archive.glob(
        '**/*',
        {
          cwd: sourceDir,
          dot: true,
          skip: HEAVY_DIR_SKIP,
        },
        {},
      );
    } else {
      archive.directory(sourceDir, false);
    }
    archive.finalize().catch(reject);
  });
}

