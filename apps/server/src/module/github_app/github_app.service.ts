import { prisma } from '../../libs/prisma';
import { AuthService } from '../auth/auth.service';
import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import type { GithubInstallationAccount } from '../../types/github.types';
import { githubClientService } from '../github_client/github_client.module';

function installationAccountFields(account: GithubInstallationAccount) {
  if (account.login) {
    return {
      login: account.login,
      id: account.id,
      accountType: account.type ?? 'User',
    };
  }
  if (account.slug) {
    return {
      login: account.slug,
      id: account.id,
      accountType: 'Organization',
    };
  }
  throw new AppError('Unsupported GitHub installation account shape', 400);
}

export default class GithubAppService {
  constructor(
    private authService: AuthService,
    private db = prisma,
  ) {}

  async createInstallation(installationId: number, userId: string, _code: string) {
    console.log({ installationId });
    logger.debug({ installationId }, 'Creating GitHub installation');
    const data = await githubClientService.getAppInstallation(installationId);
    logger.debug({ data }, 'GitHub installation data');
 
    if (!data.account) {
      console.log('Installation has no linked account');
      throw new AppError('Installation has no linked account', 400);
    }
    const {
      login: accountLogin,
      id: accountGithubId,
      accountType,
    } = installationAccountFields(data.account);
    logger.debug({ accountLogin, accountGithubId, accountType }, 'GitHub account fields');
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
    const githubAccount = user.accounts.find((acc) => acc.provider.toLowerCase() === 'github');
    logger.debug({ githubAccount }, 'GitHub account');
    if (!githubAccount) {
      throw new AppError('GitHub account not linked', 400);
    }
    const accountId = githubAccount.id;
    const installation = await prisma.githubInstallation.upsert({
      where: {
        installationId: data.id,
      },
      update: {
        accountLogin,
        accountId: accountGithubId,
        accId: accountId,
        accountType,
      },
      create: {
        installationId: data.id,
        accountLogin,
        accountId: accountGithubId,
        accId: accountId,
        accountType,
      },
    });

    return installation;
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
            provider: true,
          },
        },
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const installation_id = user.accounts
      ?.find((acc) => acc.provider.toLowerCase() === 'github')
      ?.githubInstallations?.find((installation) => installation.installationId)?.installationId;
    if (!installation_id) {
      logger.error('Github app not installed');
      throw new AppError('Github app not installed', 404);
    }

    console.log({ installation_id });
    return githubClientService.listInstallationRepositories(
      installation_id,
      String(repo_name_query ?? ''),
    );
  }
}
