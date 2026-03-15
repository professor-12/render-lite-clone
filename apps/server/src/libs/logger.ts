import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug');

const baseOptions: pino.LoggerOptions = {
  level: logLevel,
  base: { pid: process.pid },
  timestamp: pino.stdTimeFunctions.isoTime,
};

/**
 * Development: human-readable, colorized output via pino-pretty.
 * Production: JSON lines for log aggregators.
 */
const logger = isProd
  ? pino(baseOptions)
  : pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });

export { logger };
