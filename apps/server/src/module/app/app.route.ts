import express, { Router } from 'express';
import authRouter from '../auth/auth.route';
import githubAppRouter from '../github_app/github_app.route';
import githubWebhookRouter from '../github_webhook/github_webhook.route';
import detectServiceRouter from '../detect-service/detect-service.route';
import deployServiceRoute from '../deploy-service/deploy-service.route';
import { redis } from '../../libs/redis';
import { rabbitMQService } from '../../libs/rabbitmq';
import { snapshotMetrics } from '../../libs/metrics';
import { createLogger } from '../../libs/logger';

const router: Router = express.Router();
const log = createLogger({ module: 'health' });

async function checkRedis(): Promise<'up' | 'down'> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG' ? 'up' : 'down';
  } catch (err) {
    log.warn({ err }, 'Redis health check failed');
    return 'down';
  }
}

async function checkRabbit(): Promise<'up' | 'down'> {
  try {
    await rabbitMQService.connect();
    return 'up';
  } catch (err) {
    log.warn({ err }, 'RabbitMQ health check failed');
    return 'down';
  }
}

router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/ready', async (_req, res) => {
  const [redisStatus, rabbitStatus] = await Promise.all([checkRedis(), checkRabbit()]);
  const allUp = redisStatus === 'up' && rabbitStatus === 'up';
  return res.status(allUp ? 200 : 503).json({
    status: allUp ? 'ready' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: { redis: redisStatus, rabbitmq: rabbitStatus },
  });
});

router.get('/metrics', (_req, res) => {
  return res.status(200).json(snapshotMetrics());
});

router.use('/auth', authRouter);
router.use('/github', githubAppRouter);
router.use('/github', githubWebhookRouter);
router.use('/', detectServiceRouter);
router.use('/project', deployServiceRoute);
export default router;
