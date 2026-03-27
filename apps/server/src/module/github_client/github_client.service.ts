import { createAppAuth } from '@octokit/auth-app';
import { RequestError } from '@octokit/request-error';
import { Octokit } from '@octokit/rest';
import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import type { GithubTokenResponse, GithubUserData } from '../../types/github.types';

type OctokitRestClient = InstanceType<typeof Octokit>;
type ListInstallationReposResult = Awaited<
  ReturnType<OctokitRestClient['rest']['apps']['listReposAccessibleToInstallation']>
>;
type InstallationRepository = NonNullable<
  ListInstallationReposResult['data']['repositories']
>[number];

/**
 * GitHub API via Octokit. We use `@octokit/rest` + `@octokit/auth-app` instead of the
 * `octokit` meta-package so `tsx`/Node can resolve modules (the meta-package pulls
 * `@octokit/app`, which breaks under this project's loader).
 */
export class GithubClientService {
  private readonly oauthTokenUrl = 'https://github.com/login/oauth/access_token';
  private appOctokit: OctokitRestClient | null = null;

  private requireAppCredentials() {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY;
    if (!appId || !privateKey) {
      throw new AppError('GitHub App is not configured', 500);
    }
    return { appId, privateKey };
  }

  private getAppOctokit(): OctokitRestClient {
    if (!this.appOctokit) {
      const { appId, privateKey } = this.requireAppCredentials();
      this.appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
        },
      });
    }
    return this.appOctokit;
  }

  private createInstallationOctokit(installationId: number): OctokitRestClient {
    const { appId, privateKey } = this.requireAppCredentials();
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    });
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
    const octokit = new Octokit({ auth: oauthToken });

    try {
      const { data } = await octokit.rest.users.getAuthenticated();
      logger.debug({ githubUser: { id: data.id, login: data.login } }, 'GitHub user fetched');

      return {
        id: data.id,
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name ?? '',
        email: data.email ?? null,
      };
    } catch (error) {
      if (error instanceof RequestError) {
        logger.warn({ status: error.status, message: error.message }, 'GitHub user fetch failed');
        throw new AppError('Failed to fetch GitHub user', 502);
      }
      throw error;
    }
  }

  public async getAppInstallation(installationId: number) {
    const octokit = this.getAppOctokit();
    const { data } = await octokit.rest.apps.getInstallation({
      installation_id: installationId,
    });
    return data;
  }

  public async getInstallationOctokit(installationId: number) {
    return this.createInstallationOctokit(installationId);
  }

  public async listInstallationRepositories(installationId: number, repoNameQuery: string) {
    const octokit = this.createInstallationOctokit(installationId);
    const q = (repoNameQuery ?? '').toLowerCase();
    const allRepos: InstallationRepository[] = [];

    let page = 1;
    const perPage = 100;
    while (true) {
      const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
        per_page: perPage,
        page,
      });
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
}
