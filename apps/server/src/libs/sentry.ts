import { createLogger, getLogContext } from './logger';

const log = createLogger({ module: 'sentry' });

type SentryModule = typeof import('@sentry/node');

let sentry: SentryModule | null = null;
let initialized = false;

export async function initSentry() {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    log.info('SENTRY_DSN not set — Sentry disabled');
    return;
  }

  try {
    const mod = await import('@sentry/node');
    mod.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.SENTRY_RELEASE,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
      sendDefaultPii: false,
    });
    sentry = mod;
    log.info({ environment: process.env.NODE_ENV }, 'Sentry initialized');
  } catch (err) {
    log.error({ err }, 'Failed to initialize Sentry');
  }
}

export function captureException(error: unknown, context: Record<string, unknown> = {}) {
  if (!sentry) return;
  const ctx = getLogContext();
  sentry.withScope((scope) => {
    if (ctx.requestId) scope.setTag('requestId', ctx.requestId);
    if (ctx.jobId) scope.setTag('jobId', ctx.jobId);
    if (ctx.userId) scope.setUser({ id: ctx.userId });
    if (Object.keys(context).length) scope.setContext('extra', context);
    sentry!.captureException(error);
  });
}

export async function flushSentry(timeoutMs = 2000) {
  if (!sentry) return;
  try {
    await sentry.flush(timeoutMs);
  } catch (err) {
    log.warn({ err }, 'Sentry flush failed');
  }
}
