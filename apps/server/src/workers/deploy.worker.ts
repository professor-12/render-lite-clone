import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { BaseWorker } from './base.worker';
import { type DeployRequestedJob, RenderLiteQueue } from './contracts';

export class DeployWorker extends BaseWorker<DeployRequestedJob> {
  protected readonly queueName = RenderLiteQueue.DEPLOY_REQUESTED;
  protected readonly workerName = 'DeployWorker';

  protected async process(payload: DeployRequestedJob, _rawMessage: ConsumeMessage): Promise<void> {
    logger.info(
      {
        deploymentId: payload.deploymentId,
        imageTag: payload.imageTag,
        projectId: payload.projectId,
        containerPort: payload.runtime.containerPort,
        correlationId: payload.correlationId,
      },
      'Deployment job started',
    );

    // TODO: Implement container run/update and deployment state transitions.
    logger.info(
      { deploymentId: payload.deploymentId, correlationId: payload.correlationId },
      'Deployment job finished',
    );
  }
}
