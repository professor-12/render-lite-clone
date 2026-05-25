import type { Socket as IoSocket } from 'socket.io';

export type SocketAuthContext = {
  userId: string;
};

export interface ServerToClientEvents {
  'deployment:status': (payload: { deploymentId: string; status: string }) => void;
  'deployment:log': (payload: {
    deploymentId: string;
    type: 'stdout' | 'stderr';
    chunk: string;
  }) => void;
  'project:updated': (payload: { projectId: string }) => void;
  notification: (payload: { title: string; message: string; level?: 'info' | 'warn' | 'error' }) => void;
}

export interface ClientToServerEvents {
  'deployment:subscribe': (deploymentId: string) => void;
  'deployment:unsubscribe': (deploymentId: string) => void;
  'project:subscribe': (projectId: string) => void;
  'project:unsubscribe': (projectId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}

export type AppSocket = IoSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const userRoom = (userId: string) => `user:${userId}`;
export const deploymentRoom = (deploymentId: string) => `deployment:${deploymentId}`;
export const projectRoom = (projectId: string) => `project:${projectId}`;
