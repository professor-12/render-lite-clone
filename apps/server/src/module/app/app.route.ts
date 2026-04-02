import express, { Router } from 'express';
import authRouter from '../auth/auth.route';
import githubAppRouter from '../github_app/github_app.route';
import detectServiceRouter from '../detect-service/detect-service.route';
const router: Router = express.Router();

router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRouter);
router.use('/github', githubAppRouter);
router.use('/', detectServiceRouter);
export default router;
