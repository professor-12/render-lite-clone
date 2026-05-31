import { GithubWebhookController } from './github_webhook.controller';
import { GithubWebhookService } from './github_webhook.service';

const githubWebhookService = new GithubWebhookService();

export const githubWebhookController = new GithubWebhookController(githubWebhookService);

export default { githubWebhookController, githubWebhookService };
