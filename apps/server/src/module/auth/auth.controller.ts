import type { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import type { AuthService } from './auth.service.js';
import { logger } from '../../middlewares/httplogger.middleware.js';
import { prisma } from '../../libs/prisma.js';
import { success } from 'zod';
import jwt from 'jsonwebtoken';
import { getEnv } from '../../utlis.js';

process.env.JWT_SECRET;

export class AuthController {
  constructor(private authService: AuthService) {}

  public githubCallback: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OAuth code',
      });
    }

    const { user, token } = await this.authService.registerUser({ code });

    return res
      .cookie('renderLite', token, {
        httpOnly: true,
        secure: getEnv('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      })
      .status(200)
      .json({
        success: true,
        message: 'User logged in successfully',
        data: user,
      });
  });
}
