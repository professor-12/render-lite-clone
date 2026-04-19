import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';

export async function zipDirectory({
  sourceDir,
  outFile,
}: {
  sourceDir: string;
  outFile: string;
}) {
  await new Promise<void>((resolve, reject) => {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize().catch(reject);
  });
}

