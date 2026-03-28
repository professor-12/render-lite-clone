import { githubClientService } from '../module/github_client/github_client.module';
import type { GithubUserData } from '../types/github.types';

/**
 * Facade kept for existing DI (`AuthService`); all GitHub HTTP calls go through
 * `GithubClientService`.
 */
export class GithubService {
  public getGithubToken(code: string): Promise<string> {
    return githubClientService.exchangeOAuthCodeForToken(code);
  }

  public getGithubUser(token: string): Promise<GithubUserData> {
    return githubClientService.getAuthenticatedUser(token);
  }
}
