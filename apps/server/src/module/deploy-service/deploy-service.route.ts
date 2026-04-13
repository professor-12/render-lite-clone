import { Router } from 'express';
import { authenticateJwtFromCookies } from '../../middlewares/auth.middleware';
import { deployServiceController } from './deploy-service.module';

const router: Router = Router();

router.post(
  '/create',
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.createProject,
);

export default router;
