import { asyncHandler } from '../../middlewares/asyncHandler';
import { createProjectBodySchema } from '../../validators/deploy.validator';
import { DeployServiceService } from './deploy-service.service';

export class DeployServiceController {
  constructor(private readonly deployServiceService: DeployServiceService) {}

  public createProject = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }
    console.log(JSON.stringify(req.body, null, 2));
    const validatedData = createProjectBodySchema.parse(req.body);

    const project = await this.deployServiceService.createProject(validatedData, userId);

    return res.status(200).json({
      message: 'Project created successfully',
      data: project,
    });
  });
}
