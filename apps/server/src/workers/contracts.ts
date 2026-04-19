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

/**
 * Minimal build payload: worker clones repo and runs commands.
 * Keep it small so messages are cheap and workers can run statelessly.
 */
export type BuildRequestedJob = JobMetadata & {
  deploymentId: string;
  githubUrl: string;
  installCommand: string;
  buildCommand: string;
  /** Optional output directory to package + upload (e.g. dist, .next, build). */
  outDir?: string;
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
