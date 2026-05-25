import type { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { logger } from '../../libs/logger';
import { createPubSubPair } from '../../libs/redis';
import { redis } from '../../libs/redis';
import { authenticateSocket } from './socket.middleware';
import { SocketUserStore } from './socket.user-store';
import {
      type AppSocket,
      type ClientToServerEvents,
      type InterServerEvents,
      type ServerToClientEvents,
      type SocketData,
      deploymentRoom,
      projectRoom,
      userRoom,
} from './socket.types';

type TypedIO = IOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
>;

const CORS_ORIGINS = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
];

class SocketService {
      private io: TypedIO | null = null;
      private userStore: SocketUserStore | null = null;

      public async init(httpServer: HttpServer): Promise<TypedIO> {
            if (this.io) return this.io;

            const io: TypedIO = new IOServer(httpServer, {
                  cors: {
                        origin: CORS_ORIGINS,
                        credentials: true,
                  },
                  path: process.env.SOCKET_PATH ?? '/socket.io',
                  pingTimeout: 20000,
                  pingInterval: 25000,
            });

            const { pub, sub } = createPubSubPair();
            io.adapter(createAdapter(pub, sub));

            const userStore = new SocketUserStore(redis);

            io.use(authenticateSocket);

            io.on('connection', (socket: AppSocket) => {
                  const { userId } = socket.data;
                  void this.handleConnection(socket, userId, userStore);
            });

            this.io = io;
            this.userStore = userStore;

            logger.info('Socket.IO initialized with Redis adapter');
            return io;
      }

      private async handleConnection(
            socket: AppSocket,
            userId: string,
            userStore: SocketUserStore,
      ) {
            try {
                  const count = await userStore.addSocket(userId, socket.id);
                  await socket.join(userRoom(userId));
                  logger.debug({ userId, socketId: socket.id, count }, 'Socket connected');
            } catch (err) {
                  logger.error({ err, userId, socketId: socket.id }, 'Failed to register socket');
            }

            socket.on('deployment:subscribe', (deploymentId) => {
                  if (typeof deploymentId !== 'string' || !deploymentId) return;
                  void socket.join(deploymentRoom(deploymentId));
            });

            socket.on('deployment:unsubscribe', (deploymentId) => {
                  if (typeof deploymentId !== 'string' || !deploymentId) return;
                  void socket.leave(deploymentRoom(deploymentId));
            });

            socket.on('project:subscribe', (projectId) => {
                  if (typeof projectId !== 'string' || !projectId) return;
                  void socket.join(projectRoom(projectId));
            });

            socket.on('project:unsubscribe', (projectId) => {
                  if (typeof projectId !== 'string' || !projectId) return;
                  void socket.leave(projectRoom(projectId));
            });

            socket.on('disconnect', async (reason) => {
                  try {
                        const { remaining } = await userStore.removeSocket(socket.id);
                        logger.debug({ userId, socketId: socket.id, remaining, reason }, 'Socket disconnected');
                  } catch (err) {
                        logger.error({ err, socketId: socket.id }, 'Failed to deregister socket');
                  }
            });
      }

      private requireIo(): TypedIO {
            if (!this.io) {
                  throw new Error('SocketService not initialized. Call socketService.init(server) first.');
            }
            return this.io;
      }

      public requireStore(): SocketUserStore {
            if (!this.userStore) {
                  throw new Error('SocketService not initialized.');
            }
            return this.userStore;
      }

      public emitToUser<E extends keyof ServerToClientEvents>(
            userId: string,
            event: E,
            ...args: Parameters<ServerToClientEvents[E]>
      ): void {
            this.requireIo().to(userRoom(userId)).emit(event, ...args);
      }

      public emitToDeployment<E extends keyof ServerToClientEvents>(
            deploymentId: string,
            event: E,
            ...args: Parameters<ServerToClientEvents[E]>
      ): void {
            this.requireIo().to(deploymentRoom(deploymentId)).emit(event, ...args);
      }

      public emitToProject<E extends keyof ServerToClientEvents>(
            projectId: string,
            event: E,
            ...args: Parameters<ServerToClientEvents[E]>
      ): void {
            this.requireIo().to(projectRoom(projectId)).emit(event, ...args);
      }

      public broadcast<E extends keyof ServerToClientEvents>(
            event: E,
            ...args: Parameters<ServerToClientEvents[E]>
      ): void {
            this.requireIo().emit(event, ...args);
      }

      public isOnline(userId: string): Promise<boolean> {
            return this.requireStore().isOnline(userId);
      }

      public getOnlineUsers(): Promise<string[]> {
            return this.requireStore().getOnlineUsers();
      }

      public getOnlineCount(): Promise<number> {
            return this.requireStore().getOnlineCount();
      }

      public getIO(): TypedIO {
            return this.requireIo();
      }

      public async close(): Promise<void> {
            if (!this.io) return;
            await new Promise<void>((resolve) => this.io!.close(() => resolve()));
            this.io = null;
            this.userStore = null;
            logger.info('Socket.IO closed');
      }
}

export const socketService = new SocketService();
