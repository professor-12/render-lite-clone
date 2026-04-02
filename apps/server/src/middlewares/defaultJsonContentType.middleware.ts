import type { NextFunction, Request, Response } from 'express';

const METHODS_THAT_MAY_HAVE_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * If the client omits Content-Type on a mutating request, assume JSON so express.json() parses the body.
 * Does not override an explicit Content-Type (including multipart or urlencoded).
 */
export function defaultJsonContentType(req: Request, _res: Response, next: NextFunction) {
  if (!METHODS_THAT_MAY_HAVE_BODY.has(req.method)) {
    return next();
  }
  const raw = req.headers['content-type'];
  const ct = typeof raw === 'string' ? raw.trim() : '';
  if (!ct) {
    req.headers['content-type'] = 'application/json';
  }
  next();
}
