import { asyncHandler } from '../../middlewares/asyncHandler';
import { createProjectBodySchema } from '../../validators/deploy.validator';
import { DeployServiceService } from './deploy-service.service';

export class DeployServiceController {
  constructor(private readonly deployServiceService: DeployServiceService) {}

  public listProjects = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const data = await this.deployServiceService.listProjectsForUser(userId);

    return res.status(200).json({
      message: 'ok',
      data,
    });
  });

  public createProject = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }
  
    const validatedData = createProjectBodySchema.parse(req.body);

    const project = await this.deployServiceService.createProject(validatedData, userId);

    return res.status(200).json({
      message: 'Project created successfully',
      data: project,
    });
  });

  public getProject = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const projectId = String(req.params.projectId ?? '');
    const project = await this.deployServiceService.getProjectForUser(projectId, userId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'ok', data: project });
  });

  public getDeployment = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const deploymentId = String(req.params.deploymentId ?? '');
    const deployment = await this.deployServiceService.getDeploymentForUser(deploymentId, userId);
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    return res.status(200).json({ message: 'ok', data: deployment });
  });

  public getDeploymentLogs = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const deploymentId = String(req.params.deploymentId ?? '');
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

    const result = await this.deployServiceService.getDeploymentLogsForUser(deploymentId, userId, cursor);
    if (!result) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    const nextCursor = result.logs.at(-1)?.id ?? cursor ?? null;

    return res.status(200).json({
      message: 'ok',
      data: {
        deployment: result.deployment,
        logs: result.logs,
        nextCursor,
      },
    });
  });
}
