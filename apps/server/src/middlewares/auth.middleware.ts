import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from './asyncHandler';
import { verifyJwt } from '../utlis';
import { AppError } from '../errors/Apperror';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export const authenticateJwtFromCookies = (cookieName: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[cookieName];

    if (!token) {
      throw new AppError('Not Authorized', 401);
    }

    try {
      const { userId } = verifyJwt(token);

      if (!userId) {
        throw new AppError('User not found', 401);
      }

      req.userId = userId;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError('Session expired. Please login again.', 401);
      }

      throw new AppError('Invalid token', 401);
    }
  });
};
