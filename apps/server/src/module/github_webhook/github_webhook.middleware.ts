import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/Apperror';
import { getEnv } from '../../utlis';
import { createLogger } from '../../libs/logger';

const logger = createLogger({ module: 'github-webhook' });

declare module 'express-serve-static-core' {
  interface Request {
    /** Raw request body buffer, captured by express.json's `verify` hook. */
    rawBody?: Buffer;
  }
}

const SIGNATURE_HEADER = 'x-hub-signature-256';

/**
 * Verifies the GitHub webhook payload signature (HMAC SHA-256) using
 * GITHUB_WEBHOOK_SECRET. Relies on `req.rawBody` being populated by the
 * global express.json `verify` hook, since the HMAC must be computed over the
 * exact bytes GitHub signed.
 */
export const verifyGithubWebhookSignature = (req: Request, _res: Response, next: NextFunction) => {
  const signature = req.headers[SIGNATURE_HEADER];

  if (typeof signature !== 'string' || !signature.startsWith('sha256=')) {
    logger.warn('Webhook rejected: missing or malformed signature header');
    throw new AppError('Missing webhook signature', 401);
  }

  if (!req.rawBody || req.rawBody.length === 0) {
    logger.error('Webhook rejected: raw body not captured');
    throw new AppError('Unable to verify webhook payload', 400);
  }

  const hmac = crypto.createHmac('sha256', getEnv('GITHUB_WEBHOOK_SECRET'));
  const expected = `sha256=${hmac.update(req.rawBody).digest('hex')}`;

  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);

  if (
    signatureBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    logger.warn('Webhook rejected: signature mismatch');
    throw new AppError('Invalid webhook signature', 401);
  }

  next();
};
