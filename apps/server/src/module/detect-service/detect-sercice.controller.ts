import { logger } from '../../libs/logger';
import { asyncHandler } from '../../middlewares/asyncHandler';
import DetectServiceService from './detect-service.service';

class DetectServiceController {
  constructor(private readonly detectServiceService: DetectServiceService) {}

  public detectService = asyncHandler(async (req, res) => {
    console.log(req);
    logger.debug({ body: req.body }, 'Detect service request');
    const githubUrl = req.body?.githubUrl ?? '';

    if (!githubUrl) {
      return res.status(400).json({
        message: 'GitHub URL is required',
      });
    }
    const service = await this.detectServiceService.detectService(githubUrl, req.userId as string);
    return res.status(200).json({
      message: 'Service detected successfully',
      data: service,
    });
  });
}

export default DetectServiceController;
