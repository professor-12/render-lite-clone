import { Router } from 'express';
import { authController } from './auth.module';

const router: Router = Router();

router.get('/github/callback', authController.githubCallback);
router.delete('/github/logout',authController.gitLogout)
router.get("/refresh-token",authController.getRefreshToken)
// router.get('/github/login',authController.githubLogin)


export default router;
