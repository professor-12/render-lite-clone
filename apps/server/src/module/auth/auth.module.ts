import { GithubService } from '../../libs/github-service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const githubService = new GithubService();
const authService = new AuthService(githubService);

const authController = new AuthController(authService);

export { authController, authService };
