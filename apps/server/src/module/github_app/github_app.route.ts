import { Router } from 'express';
import { githubAppController } from './github_app.module';
import { authenticateJwtFromCookies } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/github/install',authenticateJwtFromCookies("renderLite-access"), githubAppController.installGithubApp);
router.get('/github/repositories',githubAppController.getInstallRepos)

export default router;
