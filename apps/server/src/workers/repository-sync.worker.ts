import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { BaseWorker } from './base.worker';
import { type RepoSyncRequestedJob, RenderLiteQueue } from './contracts';

export class RepositorySyncWorker extends BaseWorker<RepoSyncRequestedJob> {
  protected readonly queueName = RenderLiteQueue.REPO_SYNC_REQUESTED;
  protected readonly workerName = 'RepositorySyncWorker';

  protected async process(payload: RepoSyncRequestedJob, _rawMessage: ConsumeMessage): Promise<void> {
    logger.info(
      {
        projectId: payload.projectId,
        repository: payload.repository,
        correlationId: payload.correlationId,
      },
      'Repository sync started',
    );

    // TODO: plug simple-git clone/fetch logic here when project model exists.
    logger.info(
      { projectId: payload.projectId, correlationId: payload.correlationId },
      'Repository sync completed',
    );
  }
}
