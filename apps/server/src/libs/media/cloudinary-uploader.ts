import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { lookup } from 'mime-types'
import { logger } from '../logger';

type UploadResult = {
  url: string;
  publicId: string;
};

/** Use chunked API above this size; avoids single huge multipart uploads that can stall. */
const CHUNKED_UPLOAD_THRESHOLD_BYTES = 10 * 1024 * 1024;

function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);
}

function uploadDeadlineMs() {
  const raw = process.env.CLOUDINARY_UPLOAD_DEADLINE_MS;
  if (raw != null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 30 * 60 * 1000;
}

function withDeadline<T>(promise: Promise<T>, label: string): Promise<T> {
  const ms = uploadDeadlineMs();
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export async function uploadRawFileToCloudinary({
  filePath,
  publicId,
  folder = 'renderlite/builds',
  onLog,
}: {
  filePath: string;
  publicId: string;
  folder?: string;
  /** Optional progress line (e.g. build log stream). */
  onLog?: (line: string) => void;
}): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.',
    );
  }

  const st = await fs.stat(filePath);
  const sizeMiB = (st.size / (1024 * 1024)).toFixed(2);

  const baseOptions = {
    resource_type: 'raw' as const,
    folder,
    public_id: publicId,
    overwrite: true,
    // Per-request inactivity ceiling; chunked uploads use one request per chunk.
    timeout: 600_000,
  };

  onLog?.(
    st.size >= CHUNKED_UPLOAD_THRESHOLD_BYTES
      ? `Uploading ${sizeMiB} MiB to Cloudinary (chunked)...\n`
      : `Uploading ${sizeMiB} MiB to Cloudinary...\n`,
  );

  const run =
    st.size >= CHUNKED_UPLOAD_THRESHOLD_BYTES
      ? new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_large(
          filePath,
          baseOptions,
          (err?: UploadApiErrorResponse, result?: UploadApiResponse) => {
            if (err) reject(err);
            else if (!result) reject(new Error('Cloudinary upload_large returned empty result'));
            else resolve(result);
          },
        );
      })
      : cloudinary.uploader.upload(filePath, baseOptions);

  const res = await withDeadline(run, 'Cloudinary upload');

  return { url: res.secure_url, publicId: res.public_id };
}


const R2_UPLOAD_MAX_ATTEMPTS = 4;
const R2_UPLOAD_BASE_DELAY_MS = 500;

function isRetryableR2Error(err: unknown): boolean {
  const e = err as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } } | null;
  if (!e) return false;
  const code = e.code ?? e.name ?? '';
  const status = e.$metadata?.httpStatusCode;
  if (status != null && (status >= 500 || status === 408 || status === 429)) return true;
  return [
    'EPROTO',
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'EPIPE',
    'ENETUNREACH',
    'ENOTFOUND',
    'TimeoutError',
    'RequestTimeout',
    'NetworkingError',
  ].includes(code);
}

export async function uploadFileToCloudflareR2({
  filePath,
  publicId,
  onLog,
  folder
}: {
  filePath: string;
  publicId: string;
  folder?: string;
  onLog?: (line: string) => void;
}): Promise<UploadResult> {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      process.env.NODE_ENV == "development" ? 'Cloudflare R2 is not configured. Set CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET.' : "An error occured"
    );
  }

  const st = await fs.stat(filePath);
  const sizeMiB = (st.size / (1024 * 1024)).toFixed(2);
  onLog?.(`Uploading ${sizeMiB} MiB...\n`);

  const s3 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const ext = path.extname(filePath);
  const keyPrefix = (folder ?? 'renderlite/builds').replace(/^\/+|\/+$/g, '');
  const key = `${keyPrefix}/${publicId}${ext}`;
  logger.error({ key, bucket, endpoint }, 'Uploading file to Cloudflare R2');

  let lastError: unknown;
  for (let attempt = 1; attempt <= R2_UPLOAD_MAX_ATTEMPTS; attempt += 1) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: createReadStream(filePath),
          ContentLength: st.size,
          ContentType: lookup(filePath) || 'application/octet-stream',
        }),
      );
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      const retryable = isRetryableR2Error(err) && attempt < R2_UPLOAD_MAX_ATTEMPTS;
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ key, bucket, attempt, retryable, err: message }, 'Cloudflare R2 upload attempt failed');
      if (!retryable) throw err;
      // Exponential backoff with jitter.
      const delay = R2_UPLOAD_BASE_DELAY_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      onLog?.(`Upload attempt ${attempt} failed (${message}); retrying in ${delay}ms...\n`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  if (lastError) throw lastError;

  const url = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/+$/, '')}/${key}`
    : `${endpoint.replace(/\/+$/, '')}/${bucket}/${key}`;

  return { url, publicId };
}