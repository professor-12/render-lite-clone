import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import { asyncHandler } from '../../middlewares/asyncHandler';
import GithubAppService from './github_app.service';

export class GithuAppController {
  constructor(private githubService: GithubAppService) {}

  public installGithubApp = asyncHandler(async (req, res) => {
    logger.debug('Installing GitHub app');
    const { installation_id, code } = req.query;
    const userId = req.userId;
    if (!userId) {
      throw new AppError('User id not found', 404);
    }

    if (!installation_id) {
      return res.status(400).json({
        message: 'Installation ID and code are required',
      });
    }

    const installation = await this.githubService.createInstallation(
      Number(installation_id),
      userId,
      code as string,
    );

    logger.debug({ installation }, 'GitHub app installed successfully');

    return res.status(200).json({
      message: 'GitHub app installed successfully',
      installationId: installation.installationId,
      account: installation.accountLogin,
    });
  });

  public getInstallRepos = asyncHandler(async (req, res) => {
    const { 'renderLite-access': jwt_token } = req.cookies;

    const { q: repo_name_query } = req.query;
    console.log({ repo_name_query });

    if (!jwt_token) {
      res.status(401).json({
        message: 'Unathorized access',
      });
    }

    const repo = await this.githubService.getInstallationRepos(jwt_token, String(repo_name_query));

    return res.status(200).json({
      message: 'Repo fetched successfully',
      repositories: repo,
    });
  });
}
