import { Router } from 'express';
import { githubWebhookController } from './github_webhook.module';
import { verifyGithubWebhookSignature } from './github_webhook.middleware';

const router = Router();

// GitHub posts events here. The signature is verified against the raw body
// before the handler runs; no user auth applies to webhook traffic.
router.post('/webhook', verifyGithubWebhookSignature, githubWebhookController.handleWebhook);

export default router;
