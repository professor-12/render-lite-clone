export enum RenderLiteQueue {
  REPO_SYNC_REQUESTED = 'renderlite.repo.sync.requested',
  BUILD_REQUESTED = 'renderlite.build.requested',
  DEPLOY_REQUESTED = 'renderlite.deploy.requested',
  DOMAIN_PROVISION_REQUESTED = 'renderlite.domain.provision.requested',
}

export type JobMetadata = {
  correlationId: string;
  requestedByUserId?: string;
  requestedAt: string;
};

export type RepoSyncRequestedJob = JobMetadata & {
  projectId: string;
  repository: {
    owner: string;
    name: string;
    branch: string;
    provider: 'github';
  };
};

export type BuildRequestedJob = JobMetadata & {
  projectId: string;
  deploymentId: string;
  commitSha: string;
  build: {
    strategy: 'dockerfile' | 'autodetect';
    dockerfilePath?: string;
  };
};

export type DeployRequestedJob = JobMetadata & {
  projectId: string;
  deploymentId: string;
  imageTag: string;
  runtime: {
    containerPort: number;
    env: Record<string, string>;
  };
};

export type DomainProvisionRequestedJob = JobMetadata & {
  projectId: string;
  deploymentId: string;
  domain: {
    host: string;
    targetPort: number;
  };
};
