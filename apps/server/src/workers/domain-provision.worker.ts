import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { BaseWorker } from './base.worker';
import { type DomainProvisionRequestedJob, RenderLiteQueue } from './contracts';

export class DomainProvisionWorker extends BaseWorker<DomainProvisionRequestedJob> {
  protected readonly queueName = RenderLiteQueue.DOMAIN_PROVISION_REQUESTED;
  protected readonly workerName = 'DomainProvisionWorker';

  protected async process(
    payload: DomainProvisionRequestedJob,
    _rawMessage: ConsumeMessage,
  ): Promise<void> {
    logger.info(
      {
        deploymentId: payload.deploymentId,
        host: payload.domain.host,
        targetPort: payload.domain.targetPort,
        projectId: payload.projectId,
        correlationId: payload.correlationId,
      },
      'Domain provision job started',
    );

    // TODO: Implement Caddy/Nginx route configuration for service host.
    logger.info(
      {
        deploymentId: payload.deploymentId,
        host: payload.domain.host,
        correlationId: payload.correlationId,
      },
      'Domain provision job finished',
    );
  }
}
