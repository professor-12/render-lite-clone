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
  // public githubLogin:RequestHandler = asyncHandler(async(req:Request,res:Response)=>{
  //   const githubUrl =`https://github.com/login/oauth/authorize?client_id=${getEnv(
  //   'GITHUB_CLIENT_ID'
  // )}&redirect_uri=${getEnv('GITHUB_CALLBACK_URL')}&scope=user:email`;
  // res.redirect(githubUrl)


  // })
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
