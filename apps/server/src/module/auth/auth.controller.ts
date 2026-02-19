import type { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import type { AuthService } from './auth.service';
import { logger } from '../../middlewares/httplogger.middleware';
import { prisma } from '../../libs/prisma';
import { success } from 'zod';
import jwt from 'jsonwebtoken';
import { getEnv } from '../../utlis';

process.env.JWT_SECRET;

export class AuthController {
  constructor(private authService: AuthService) {}
  public gitLogout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('renderLite', {
      httpOnly: true,
      secure: getEnv('NODE_ENV') === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({
      message: 'Cookies cleared successfully',
    });
  });
  public githubCallback: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OAuth code',
      });
    }

    const { user, access_token, refresh_token } = await this.authService.registerUser({ code });

    res.cookie('renderLite-access', access_token, {
      httpOnly: true,
      secure: getEnv('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 30, // 24 hours
    });

    res.cookie('renderLite-refresh', refresh_token, {
      httpOnly: true,
      secure: getEnv('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/refresh',
    });
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: user,
    });
  });

  public getRefreshToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { 'renderLite-refresh': old_refresh_token } = req.cookies;
      if (!old_refresh_token) {
        return res.status(401).json({
          message: 'No refresh TOken provided',
        });
      }
      const { access_token, refresh_token } =
        await this.authService.refreshAccessToken(old_refresh_token);
      res.cookie('renderLite-access', access_token, {
        httpOnly: true,
        secure: getEnv('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 30, // 24 hours
      });

      res.cookie('renderLite-refresh', refresh_token, {
        httpOnly: true,
        secure: getEnv('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: '/refresh',
      });
      return res.json({
        message: 'tokens refreshed',
      });
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid refresh token',
      });
    }
  });
}
