import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import type { ExtendedError } from 'socket.io';
import { verifyJwt } from '../../utlis';
import { logger } from '../../libs/logger';
import type { AppSocket } from './socket.types';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'access_token';

export const authenticateSocket = (
  socket: AppSocket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    const handshakeAuth = socket.handshake.auth as { token?: string } | undefined;

    let token: string | undefined;

    if (rawCookie) {
      const parsed = cookie.parse(rawCookie);
      token = parsed[COOKIE_NAME];
    }
    if (!token && handshakeAuth?.token) {
      token = handshakeAuth.token;
    }

    if (!token) {
      return next(new Error('Unauthorized: missing token'));
    }

    const { userId } = verifyJwt(token);
    if (!userId) {
      return next(new Error('Unauthorized: invalid token payload'));
    }

    socket.data.userId = userId;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.debug({ socketId: socket.id }, 'Socket auth: token expired');
      return next(new Error('Unauthorized: token expired'));
    }
    logger.debug({ err, socketId: socket.id }, 'Socket auth failed');
    return next(new Error('Unauthorized'));
  }
};
