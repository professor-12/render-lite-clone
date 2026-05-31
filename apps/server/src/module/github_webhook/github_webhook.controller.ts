import { asyncHandler } from '../../middlewares/asyncHandler';
import { createLogger } from '../../libs/logger';
import { GithubWebhookService } from './github_webhook.service';

const logger = createLogger({ module: 'github-webhook' });

export class GithubWebhookController {
  constructor(private webhookService: GithubWebhookService) {}

  public handleWebhook = asyncHandler(async (req, res) => {
    const event = req.headers['x-github-event'];
    const delivery = req.headers['x-github-delivery'];

    if (typeof event !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing X-GitHub-Event header' });
    }

    logger.info({ event, delivery }, 'Received GitHub webhook');

    // Acknowledge fast; act on the event after responding so GitHub never
    // sees a timeout while builds are queued.
    const result = await this.webhookService.handleEvent(event, req.body);

    return res.status(200).json({ success: true, ...result });
  });
}
