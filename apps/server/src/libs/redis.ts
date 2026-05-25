import Redis, { type RedisOptions } from 'ioredis';
import { logger } from './logger';

const DEFAULT_URL = 'redis://localhost:6379';

const buildOptions = (): RedisOptions => ({
  lazyConnect: false,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy: (times) => Math.min(times * 200, 5000),
});

const createClient = (label: string): Redis => {
  const url = process.env.REDIS_URL ?? DEFAULT_URL;
  const client = new Redis(url, buildOptions());

  client.on('connect', () => logger.info({ label, url }, 'Redis connecting'));
  client.on('ready', () => logger.info({ label }, 'Redis ready'));
  client.on('error', (err) => logger.error({ err, label }, 'Redis error'));
  client.on('close', () => logger.warn({ label }, 'Redis connection closed'));
  client.on('reconnecting', () => logger.warn({ label }, 'Redis reconnecting'));

  return client;
};

export const redis = createClient('redis:main');

export const createPubSubPair = (): { pub: Redis; sub: Redis } => ({
  pub: createClient('redis:pub'),
  sub: createClient('redis:sub'),
});

export const closeRedis = async () => {
  try {
    await redis.quit();
  } catch (err) {
    logger.error({ err }, 'Failed to close redis cleanly');
  }
};