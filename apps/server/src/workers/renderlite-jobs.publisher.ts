import { rabbitMQService } from '../libs/rabbitmq';
import {
  type BuildRequestedJob,
  type DeployRequestedJob,
  type DomainProvisionRequestedJob,
  type RepoSyncRequestedJob,
  RenderLiteQueue,
} from './contracts';

export class RenderLiteJobsPublisher {
  public async publishRepoSyncRequested(job: RepoSyncRequestedJob) {
    await rabbitMQService.publish(RenderLiteQueue.REPO_SYNC_REQUESTED, job);
  }

  public async publishBuildRequested(job: BuildRequestedJob) {
    await rabbitMQService.publish(RenderLiteQueue.BUILD_REQUESTED, job);
  }

  public async publishDeployRequested(job: DeployRequestedJob) {
    await rabbitMQService.publish(RenderLiteQueue.DEPLOY_REQUESTED, job);
  }

  public async publishDomainProvisionRequested(job: DomainProvisionRequestedJob) {
    await rabbitMQService.publish(RenderLiteQueue.DOMAIN_PROVISION_REQUESTED, job);
  }
}

export const renderLiteJobsPublisher = new RenderLiteJobsPublisher();
