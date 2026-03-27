import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { BaseWorker } from './base.worker';
import { type BuildRequestedJob, RenderLiteQueue } from './contracts';

export class BuildWorker extends BaseWorker<BuildRequestedJob> {
  protected readonly queueName = RenderLiteQueue.BUILD_REQUESTED;
  protected readonly workerName = 'BuildWorker';

  protected async process(payload: BuildRequestedJob, _rawMessage: ConsumeMessage): Promise<void> {
    logger.info(
      {
        deploymentId: payload.deploymentId,
        projectId: payload.projectId,
        commitSha: payload.commitSha,
        strategy: payload.build.strategy,
        correlationId: payload.correlationId,
      },
      'Build job started',
    );

    // TODO: Implement Dockerfile detection, image build and artifact publishing.
    logger.info(
      { deploymentId: payload.deploymentId, correlationId: payload.correlationId },
      'Build job finished',
    );
  }
}
