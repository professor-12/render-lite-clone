import pinoHttp from 'pino-http';
import { logger } from '../libs/logger';
import { recordHttpRequest } from '../libs/metrics';

export { logger };

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  genReqId: (req) => (req as { id?: string }).id ?? '',

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
        id: req.id,
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

  customProps(req, res) {
    recordHttpRequest(req.method ?? 'UNKNOWN', res.statusCode);
    return {};
  },
});
