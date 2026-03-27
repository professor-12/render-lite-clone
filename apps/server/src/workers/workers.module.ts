import { logger } from '../libs/logger';
import { BuildWorker } from './build.worker';
import { DeployWorker } from './deploy.worker';
import { DomainProvisionWorker } from './domain-provision.worker';
import { RepositorySyncWorker } from './repository-sync.worker';

export class RenderLiteWorkerRegistry {
  private readonly workers = [
    new RepositorySyncWorker(),
    new BuildWorker(),
    new DeployWorker(),
    new DomainProvisionWorker(),
  ];

  public async startAll() {
    await Promise.all(this.workers.map((worker) => worker.start()));
    logger.info({ workerCount: this.workers.length }, 'All RenderLite workers started');
  }
}

export const renderLiteWorkerRegistry = new RenderLiteWorkerRegistry();
