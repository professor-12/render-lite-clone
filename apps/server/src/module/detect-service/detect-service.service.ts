import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import { userAccountService } from '../../libs/user-account.service';
import { GithubRepository } from '../../types/github.types';
import { githubClientService } from '../github_client/github_client.module';

class DetectServiceService {
  public detectService = async (githubUrl: string, userId: string) => {
    const user = await userAccountService.getUserWithAccounts(userId);
    const githubAccount = user.accounts.find(
      (account) => account.provider.toLowerCase() === 'github',
    );
    if (!githubAccount) {
      throw new AppError('GitHub account not found', 401);
    }
    const { owner, repo } = this.extractOwnerAndRepo(githubUrl);
    const githubInstallation = githubAccount.githubInstallations.find(({ accountLogin }) => {
      return accountLogin === owner;
    });
    logger.debug({ githubInstallation }, 'GitHub installation found');
    if (!githubInstallation) {
      throw new AppError('GitHub installation not found', 400);
    }
    const repository = await githubClientService.getRepository({
      installationId: githubInstallation.installationId,
      repoName: repo,
      owner: owner,
    });

    logger.debug({ repository }, 'Repository found');
    const { default_branch: branch, name: repo_name } = repository as GithubRepository;
    const buildCommand = await githubClientService.getBuildCommand({
      installationId: githubInstallation.installationId,
      repoName: repo,
      branch: branch,
      rootDir: '',
      owner: owner,
    });
    return {
      buildCommand,
    };
  };
  private extractOwnerAndRepo(githubUrl: string) {
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new AppError('Invalid GitHub URL', 400);

    return {
      owner: match[1],
      repo: match[2],
    };
  }
}

export default DetectServiceService;
