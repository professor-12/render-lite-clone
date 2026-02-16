import { GithubService } from '../../libs/github-service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const githubService = new GithubService();
const authService = new AuthService(githubService);

const authController = new AuthController(authService);

export { authController, authService };
