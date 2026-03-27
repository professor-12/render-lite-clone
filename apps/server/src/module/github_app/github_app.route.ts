import { Router } from 'express';
import { githubAppController } from './github_app.module';
import { authenticateJwtFromCookies } from '../../middlewares/auth.middleware';

const router = Router();

router.get(
  '/install',
  authenticateJwtFromCookies('renderLite-access'),
  githubAppController.installGithubApp,
);
router.get('/repositories', githubAppController.getInstallRepos);

export default router;
