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
export type ProjectType = 'static' | 'dynamic';

export type BuildRequestedJob = JobMetadata & {
  deploymentId: string;
  githubUrl: string;
  installCommand: string;
  buildCommand: string;
  /** Language-level environment: drives preset Docker image for isolated builds. */
  buildLanguage: string;
  /** Static site vs dynamic/persistent server. Drives downstream deploy strategy. */
  projectType: ProjectType;
  /** Optional output directory to package + upload (e.g. dist, .next, build). */
  outDir?: string;
  rootDir?: string;
};

export type DeployArtifactKind = 'zip' | 'docker-image-tar';

export type DeployRequestedJob = JobMetadata & {
  projectId: string;
  deploymentId: string;
  /** Public URL or R2 URL where the artifact lives. */
  artifactUrl: string;
  /** Optional R2 object key, set by the build worker so the deploy worker doesn't have to parse the URL. */
  artifactKey?: string;
  artifactKind: DeployArtifactKind;
  /** Drives runtime image choice for zip artifacts. */
  buildLanguage: string;
  /** Static site vs dynamic/persistent server. Drives deploy strategy. */
  projectType: ProjectType;
  startCommand: string;
  rootDir?: string | null;
  outDir?: string | null;
  runtime: {
    containerPort: number;
    /** Raw "KEY=VALUE" strings, as stored on the Deployment. */
    env: string[];
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
