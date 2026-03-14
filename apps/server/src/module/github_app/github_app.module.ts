import { GithuAppController } from './github_app.controller';
import GithubAppService from './github_app.service';

const githubAppService = new GithubAppService();

export const githubAppController = new GithuAppController(githubAppService);

export default { githubAppController, githubAppService };
