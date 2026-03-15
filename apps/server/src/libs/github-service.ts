import { AppError } from '../errors/Apperror';
import { logger } from '../middlewares/httplogger.middleware';
import type { GithubTokenResponse, GithubUserData } from '../types/github.types';

export class GithubService {
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userUrl = 'https://api.github.com/user';

  public async getGithubToken(code: string): Promise<string> {
    if (!code) {
      throw new AppError('Authorization code is required', 400);
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      logger.error('GitHub OAuth environment variables missing');
      throw new AppError('OAuth configuration error', 500);
    }

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'GitHub token request failed');
        throw new AppError('Failed to fetch GitHub token', 502);
      }

      const data: GithubTokenResponse = await response.json();

      if (data.error) {
        logger.warn({ error: data.error, description: data.error_description }, 'GitHub OAuth error');
        throw new AppError(data.error_description || 'GitHub authentication failed', 401);
      }

      if (!data.access_token) {
        throw new AppError('Invalid GitHub token response', 500);
      }

      logger.info('GitHub token successfully retrieved');

      return data.access_token;
    } catch (error) {
      logger.error({ err: error }, 'Unexpected GitHub OAuth error');
      throw error;
    }
  }

  public async getGithubUser(token: string): Promise<GithubUserData> {
    const response = await fetch(this.userUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, 'GitHub user fetch failed');
      throw new AppError('Failed to fetch GitHub user', 502);
    }

    const json = await response.json();
    logger.info({ user: json });
    return json;
  }
}
