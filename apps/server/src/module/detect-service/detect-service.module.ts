import DetectServiceController from './detect-sercice.controller';
import DetectServiceService from './detect-service.service';

const detectServiceService = new DetectServiceService();
const detectServiceController = new DetectServiceController(detectServiceService);

export default { detectServiceController, detectServiceService };
