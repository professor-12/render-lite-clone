import gh from 'parse-github-url';
import { AppError } from '../../errors/Apperror';
import { mapGithubRuntimeToBuildLanguage } from '../../libs/build/build-language';
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

    if (!githubInstallation) {
      throw new AppError('GitHub installation not found', 400);
    }
    const repository = await githubClientService.getRepository({
      installationId: githubInstallation.installationId,
      repoName: repo,
      owner: owner,
    });

    const { default_branch: branch, name: repo_name } = repository as GithubRepository;
    const detected = await githubClientService.getBuildCommand({
      installationId: githubInstallation.installationId,
      repoName: repo,
      branch: branch,
      rootDir: '',
      owner: owner,
    });
    return {
      buildCommand: detected,
      buildLanguage: mapGithubRuntimeToBuildLanguage(detected.runtime),
      projectType: detected.projectType,
    };
  };
  private extractOwnerAndRepo(githubUrl: string) {
    // parse-github-url normalises every form (https, ssh, with/without .git,
    // .../tree/<branch> deep links) and strips the .git suffix for us.
    const parsed = gh(githubUrl);
    if (!parsed?.owner || !parsed?.name) {
      throw new AppError('Invalid GitHub URL', 400);
    }

    return {
      owner: parsed.owner,
      repo: parsed.name,
    };
  }
}

export default DetectServiceService;
