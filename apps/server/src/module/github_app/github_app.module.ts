import { GithuAppController } from './github_app.controller';
import GithubAppService from './github_app.service';
import { authService } from '../auth/auth.module';

const githubAppService = new GithubAppService(authService);

export const githubAppController = new GithuAppController(githubAppService);

export default { githubAppController, githubAppService };
