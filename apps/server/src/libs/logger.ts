import pino, { type Logger, type LoggerOptions } from 'pino';
import { AsyncLocalStorage } from 'node:async_hooks';

const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug');

export type LogContext = {
  requestId?: string;
  jobId?: string;
  userId?: string;
  [key: string]: unknown;
};

const contextStorage = new AsyncLocalStorage<LogContext>();

export function runWithLogContext<T>(context: LogContext, fn: () => T): T {
  const parent = contextStorage.getStore();
  return contextStorage.run({ ...parent, ...context }, fn);
}

export function getLogContext(): LogContext {
  return contextStorage.getStore() ?? {};
}

export function patchLogContext(patch: LogContext) {
  const current = contextStorage.getStore();
  if (current) Object.assign(current, patch);
}

const baseOptions: LoggerOptions = {
  level: logLevel,
  base: { pid: process.pid, service: 'renderlite-server' },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    const ctx = contextStorage.getStore();
    if (!ctx) return {};
    const { requestId, jobId, userId } = ctx;
    return { requestId, jobId, userId };
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.installation_token',
    ],
    censor: '[redacted]',
  },
};

const rootLogger: Logger = isProd
  ? pino(baseOptions)
  : pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname,service',
          singleLine: false,
        },
      },
    });

export function createLogger(bindings: { module: string; [key: string]: unknown }): Logger {
  return rootLogger.child(bindings);
}

export { rootLogger as logger };
