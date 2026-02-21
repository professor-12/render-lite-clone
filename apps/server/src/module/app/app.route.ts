import express, { Router } from 'express';
import authRouter from '../auth/auth.route';

const router: Router = express.Router();

router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRouter);
export default router;
