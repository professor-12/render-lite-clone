import { DeployServiceController } from './deploy-service.controller';
import { DeployServiceService } from './deploy-service.service';

const deployServiceService = new DeployServiceService();
const deployServiceController = new DeployServiceController(deployServiceService);

export { deployServiceController, deployServiceService };
