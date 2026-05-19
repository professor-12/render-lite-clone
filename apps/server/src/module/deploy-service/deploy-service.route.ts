import { Router } from 'express';
import { authenticateJwtFromCookies } from '../../middlewares/auth.middleware';
import { deployServiceController } from './deploy-service.module';

const router: Router = Router();

router.get(
  '/',
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.listProjects,
);

router.get(
  '/:projectId',
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.getProject,
);

router.get(
  '/deployments/:deploymentId',
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.getDeployment,
);

router.get(
  '/deployments/:deploymentId/logs',
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.getDeploymentLogs,
);

router.post(
  '/create',
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.createProject,
);

router.post("/deployments/:deploymentId/redeploy",
  authenticateJwtFromCookies('renderLite-access'),
  deployServiceController.redeploy,
);

export default router;
