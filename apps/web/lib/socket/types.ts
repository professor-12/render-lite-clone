export type DeploymentStatusPayload = {
  deploymentId: string;
  status: string;
};

export type DeploymentLogPayload = {
  deploymentId: string;
  type: 'stdout' | 'stderr';
  chunk: string;
};

export type ProjectUpdatedPayload = {
  projectId: string;
};

export type NotificationPayload = {
  title: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
};

export interface ServerToClientEvents {
  'deployment:status': (payload: DeploymentStatusPayload) => void;
  'deployment:log': (payload: DeploymentLogPayload) => void;
  'project:updated': (payload: ProjectUpdatedPayload) => void;
  notification: (payload: NotificationPayload) => void;
}

export interface ClientToServerEvents {
  'deployment:subscribe': (deploymentId: string) => void;
  'deployment:unsubscribe': (deploymentId: string) => void;
  'project:subscribe': (projectId: string) => void;
  'project:unsubscribe': (projectId: string) => void;
}