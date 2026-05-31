import jwt from 'jsonwebtoken';
import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import { detectBuild, type BuildResult, type RepoFile } from '../../libs/build/detect';
import type {
  GithubInstallationReposResponse,
  GithubInstallationResponse,
  GithubInstallationTokenResponse,
  GithubRepository,
  GithubTokenResponse,
  GithubUserData,
  GithubUserResponse,
} from '../../types/github.types';

const GITHUB_API = 'https://api.github.com';
const API_VERSION = '2022-11-28';
export interface GithubRepositoryContentResponse {
  path: string;
  url: string;
}

export class GithubClientService {
  private readonly oauthTokenUrl = 'https://github.com/login/oauth/access_token';

  private requireAppCredentials() {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!appId || !privateKey) {
      throw new AppError('GitHub App is not configured', 500);
    }
    return { appId, privateKey };
  }

  private signAppJwt(): string {
    const { appId, privateKey } = this.requireAppCredentials();
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({ iss: appId, iat: now - 60, exp: now + 10 * 60 }, privateKey, {
      algorithm: 'RS256',
    });
  }

  private async githubFetch<T>(
    url: string,
    token: string,
    tokenType: 'Bearer' | 'token' = 'Bearer',
  ): Promise<T> {
    const res = await fetch(url, {
      headers: {
        Authorization: `${tokenType} ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn({ status: res.status, url, body }, 'GitHub API request failed');
      throw new AppError(`GitHub API error (${res.status})`, res.status);
    }

    return res.json() as Promise<T>;
  }

  private async getInstallationToken(installationId: number): Promise<string> {
    const appJwt = this.signAppJwt();
    const url = `${GITHUB_API}/app/installations/${installationId}/access_tokens`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn({ status: res.status, installationId, body }, 'Failed to get installation token');
      throw new AppError('Failed to get GitHub installation token', 502);
    }

    const data = (await res.json()) as GithubInstallationTokenResponse;
    return data.token;
  }

  public async exchangeOAuthCodeForToken(code: string): Promise<string> {
    if (!code) {
      throw new AppError('Authorization code is required', 400);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      logger.error('GitHub OAuth environment variables missing');
      throw new AppError('OAuth configuration error', 500);
    }

    try {
      const response = await fetch(this.oauthTokenUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'GitHub token request failed');
        throw new AppError('Failed to fetch GitHub token', 502);
      }

      const data = (await response.json()) as GithubTokenResponse;

      if (data.error) {
        logger.warn(
          { error: data.error, description: data.error_description },
          'GitHub OAuth error',
        );
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

  public async getAuthenticatedUser(oauthToken: string): Promise<GithubUserData> {
    try {
      const data = await this.githubFetch<GithubUserResponse>(
        `${GITHUB_API}/user`,
        oauthToken,
        'token',
      );
      logger.debug({ githubUser: { id: data.id, login: data.login } }, 'GitHub user fetched');

      return {
        id: data.id,
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name ?? '',
        email: data.email ?? null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.warn({ err: error }, 'GitHub user fetch failed');
      throw new AppError('Failed to fetch GitHub user', 502);
    }
  }

  public async getAppInstallation(installationId: number): Promise<GithubInstallationResponse> {
    logger.debug({ installationId }, 'Getting app installation');
    const appJwt = this.signAppJwt();
    return this.githubFetch<GithubInstallationResponse>(
      `${GITHUB_API}/app/installations/${installationId}`,
      appJwt,
    );
  }

  public async listInstallationRepositories(
    installationId: number,
    repoNameQuery: string,
  ): Promise<GithubRepository[]> {
    const token = await this.getInstallationToken(installationId);
    const q = (repoNameQuery ?? '').toLowerCase();
    const allRepos: GithubRepository[] = [];

    let page = 1;
    const perPage = 100;
    while (true) {
      const data = await this.githubFetch<GithubInstallationReposResponse>(
        `${GITHUB_API}/installation/repositories?per_page=${perPage}&page=${page}`,
        token,
      );
      allRepos.push(...data.repositories);
      if (data.repositories.length < perPage) {
        break;
      }
      page += 1;
    }

    logger.info({ total: allRepos.length, installationId }, 'Installation repositories loaded');

    if (!q) {
      return allRepos;
    }

    return allRepos.filter((repo) => repo.name.toLowerCase().includes(q));
  }

  public async getRepository({
    installationId,
    repoName,
    owner,
  }: {
    installationId: number;
    repoName: string;
    owner: string;
  }): Promise<GithubRepository> {
    const accessToken = await this.getInstallationToken(installationId);
    const url = `${GITHUB_API}/repos/${owner}/${repoName}`;
    return this.githubFetch<GithubRepository>(url, accessToken);
  }

  public async getBuildCommand({
    installationId,
    repoName,
    branch,
    rootDir,
    owner,
  }: {
    installationId: number;
    repoName: string;
    branch: string;
    rootDir: string;
    owner: string;
  }): Promise<BuildResult> {
    const accessToken = await this.getInstallationToken(installationId);
    const url = `${GITHUB_API}/repos/${owner}/${repoName}/contents/${rootDir}`;
    const data = await this.githubFetch<GithubRepositoryContentResponse[]>(url, accessToken);
    logger.debug({ count: data.length }, 'Repository contents fetched');

    const files: RepoFile[] = data.map((entry) => ({
      name: entry.path.split('/').pop() ?? '',
      path: entry.path,
      type: entry.path.endsWith('/') ? 'dir' : 'file',
      download_url: entry.url,
    }));

    return detectBuild(files, (fileUrl) => this.githubFetch(fileUrl, accessToken));
  }
}
