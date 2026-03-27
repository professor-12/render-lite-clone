import { prisma } from '../../libs/prisma';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service';
import { nextTick } from 'process';
import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
export default class GithubAppService {
  constructor(
    private authService: AuthService,
    private db = prisma,
  ) {}

  async createInstallation(installationId: number, userId: string, code: string) {
    const token = this.getAppToken();

    const response = await fetch(`https://api.github.com/app/installations/${installationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch installation details: ${response.statusText}`);
    }

    const data = await response.json();
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        accounts: true,
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const githubAccount = user.accounts.find((acc) => acc.provider === 'github');

    if (!githubAccount) {
      throw new AppError('GitHub account not linked', 400);
    }
    const accountId = githubAccount.id;
    const installation = await prisma.githubInstallation.upsert({
      where: {
        installationId: data.id
      },
      update: {
        accountLogin: data.account.login,
        accountId: data.account.id,
        accId: accountId,
        accountType: data.account.type,
      },
      create: {
        installationId: data.id,
        accountLogin: data.account.login,
        accountId: data.account.id,
        accId: accountId,
        accountType: data.account.type,
      },
    });

    return installation;
  }

  public getAppToken = () => {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10 * 60, // expires in 10 minutes
      iss: process.env.GITHUB_APP_ID, // GitHub App ID
    };

    const token = jwt.sign(payload, process.env.GITHUB_PRIVATE_KEY as string as string, {
      algorithm: 'RS256',
    });

    return token;
  };

  async getinstallationToken(installation_id: string) {
    const appJwt = this.getAppToken();
    const res = await fetch(
      `https://api.github.com/app/installations/${installation_id}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );
    const data = await res.json();

    return data.token;
  }

  async getInstallationRepos(jwt_token: string, repo_name_query: string) {
    const { userId: id } = this.authService.verifyJwt(jwt_token);
    const user = await this.db.user.findUnique({
      where: {
        id,
      },
      select: {
        accounts: {
          select: {
            githubInstallations: true,
          },
        },
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const installation_id = user.accounts?.[0]?.githubInstallations?.[0]?.installationId;
    if (!installation_id) {
      logger.error('Github app not installed');
      throw new AppError('Github app not installed', 404);
    }
    const token = await this.getinstallationToken(String(installation_id));
    const res = await fetch(`https://api.github.com/installation/repositories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-Github-Api-Version': '2022-11-28',
      },
    });
    const data = await res.json();
    logger.info({ data });
    const filtered = data.repositories.filter((repo: any) =>
      repo.name.toLowerCase().includes(repo_name_query?.toLowerCase()),
    );

    return filtered;
  }
}
