import { Router } from 'express';
import detectServiceModule from './detect-service.module';
import { authenticateJwtFromCookies } from '../../middlewares/auth.middleware';

const router: Router = Router();

router.post(
  '/detect-service',
  authenticateJwtFromCookies('renderLite-access'),
  detectServiceModule.detectServiceController.detectService,
);

export default router;
