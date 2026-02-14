import pinoHttp from 'pino-http';
import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino();
