import pinoHttp from 'pino-http';
import { logger } from '../libs/logger';

export { logger };

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage(req, _res, error) {
    return `${req.method} ${req.url} failed: ${error.message}`;
  },

  customReceivedMessage(req) {
    return `--> ${req.method} ${req.url}`;
  },

  customAttributeKeys: {
    req: 'req',
    res: 'res',
    err: 'err',
    responseTime: 'ms',
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },

  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
