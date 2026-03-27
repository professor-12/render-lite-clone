import { prisma } from '../../libs/prisma';
import { AuthService } from '../auth/auth.service';
import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import type { GithubClientService } from '../github_client/github_client.service';
import { githubClientService } from '../github_client/github_client.module';

type InstallationPayload = Awaited<ReturnType<GithubClientService['getAppInstallation']>>;
type InstallationAccount = NonNullable<InstallationPayload['account']>;

function installationAccountFields(account: InstallationAccount) {
  if ('login' in account && typeof account.login === 'string') {
    return {
      login: account.login,
      id: account.id,
      accountType: 'type' in account && typeof account.type === 'string' ? account.type : 'User',
    };
  }
  if ('slug' in account && typeof account.slug === 'string') {
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
    const data = await githubClientService.getAppInstallation(installationId);
    if (!data.account) {
      throw new AppError('Installation has no linked account', 400);
    }
    const {
      login: accountLogin,
      id: accountGithubId,
      accountType,
    } = installationAccountFields(data.account);

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
      ?.find((acc) => acc.provider === 'github')
      ?.githubInstallations?.find((installation) => installation.installationId)?.installationId;
    if (!installation_id) {
      logger.error('Github app not installed');
      throw new AppError('Github app not installed', 404);
    }

    return githubClientService.listInstallationRepositories(
      installation_id,
      String(repo_name_query ?? ''),
    );
  }
}
