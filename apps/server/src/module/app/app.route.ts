import express, { Router } from 'express';
import authRouter from '../auth/auth.route.js';
import { authController } from '../auth/auth.module.js';

const router: Router = express.Router();

router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.get('/github/callback', authController.githubCallback);
router.use(authRouter);
export default router;
