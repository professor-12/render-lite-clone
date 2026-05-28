import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { runWithLogContext } from '../libs/logger';

const HEADER = 'x-request-id';

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header(HEADER);
  const requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();
  (req as unknown as { id: string }).id = requestId;
  res.setHeader(HEADER, requestId);

  runWithLogContext({ requestId }, () => next());
}
