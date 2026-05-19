import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import type { Readable } from 'node:stream';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Resolve the R2 object key for an artifact, given the URL stored on the deployment
 * and the optional explicit key from the build worker. Returns null if the URL does not
 * point at the configured R2 bucket.
 */
function resolveR2KeyFromUrl(url: string, explicitKey: string | undefined): string | null {
  if (explicitKey) return explicitKey;

  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT?.replace(/\/+$/, '');
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/+$/, '');

  if (publicBaseUrl && url.startsWith(`${publicBaseUrl}/`)) {
    return url.slice(publicBaseUrl.length + 1);
  }
  if (endpoint && bucket && url.startsWith(`${endpoint}/${bucket}/`)) {
    return url.slice(`${endpoint}/${bucket}/`.length);
  }
  return null;
}

/**
 * Download the artifact identified by URL/key into destPath. Uses the S3 client when
 * we can resolve an R2 key (works for private buckets); otherwise falls back to HTTP.
 */
export async function downloadArtifact({
  url,
  explicitKey,
  destPath,
  onLog,
}: {
  url: string;
  explicitKey?: string;
  destPath: string;
  onLog?: (line: string) => void;
}): Promise<void> {
  const key = resolveR2KeyFromUrl(url, explicitKey);

  if (key) {
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucket = process.env.CLOUDFLARE_R2_BUCKET;
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('Cloudflare R2 is not configured for artifact download.');
    }
    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
    onLog?.(`Fetching artifact from R2 (${key})...\n`);
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!res.Body) throw new Error('R2 GetObject returned empty body');
    await fs.mkdir(destPath.replace(/\/[^/]+$/, ''), { recursive: true });
    await pipeline(res.Body as Readable, createWriteStream(destPath));
    return;
  }

  // Fallback: public HTTP download.
  onLog?.(`Fetching artifact via HTTP...\n`);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Artifact download failed (${res.status}): ${url}`);
  }
  await fs.mkdir(destPath.replace(/\/[^/]+$/, ''), { recursive: true });
  await pipeline(res.body as unknown as Readable, createWriteStream(destPath));
}
