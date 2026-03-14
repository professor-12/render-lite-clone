import { Router } from 'express';
import { githubAppController } from './github_app.module';

const router = Router();

router.get('/github/install', githubAppController.installGithubApp);

export default router;
