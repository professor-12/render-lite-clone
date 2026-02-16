import { Router } from 'express';
import { authController } from './auth.module';

const router: Router = Router();

router.get('/github/callback', authController.githubCallback);

export default router;
