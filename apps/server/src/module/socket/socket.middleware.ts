import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import type { ExtendedError } from 'socket.io';
import { verifyJwt } from '../../utlis';
import { logger } from '../../libs/logger';
import type { AppSocket } from './socket.types';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'renderLite-access';

export const authenticateSocket = (
  socket: AppSocket,
  next: (err?: ExtendedError) => void,
) => {
  try {

    const cookies = socket.request.headers.cookie;
    logger.debug({
      socketId: socket.id,
      cookies
    }, 'Authenticating socket connection');

    let token: string | undefined

    if (cookies) {
      const parsedCookies = cookies.split(';').find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
      token = parsedCookies ? parsedCookies.split('=')[1] : undefined;
    }

    if (!token) {
      logger.error({
        "message": "Unauthorized: missing token",
        "socketId": socket.id,
      })
      return next(new Error('Unauthorized: missing token'));
    }


    const { userId } = verifyJwt(token);
    if (!userId) {
      logger.error({
        "message": "Invalid token payload",
        "socketId": socket.id,
      })
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
