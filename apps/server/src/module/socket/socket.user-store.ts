import type Redis from 'ioredis';

const USER_SOCKETS_KEY = (userId: string) => `socket:user:${userId}:sockets`;
const SOCKET_USER_KEY = (socketId: string) => `socket:id:${socketId}:user`;
const ONLINE_USERS_KEY = 'socket:online:users';

const TTL_SECONDS = 60 * 60 * 24;

export class SocketUserStore {
  constructor(private readonly redis: Redis) { }

  async addSocket(userId: string, socketId: string): Promise<number> {
    const pipeline = this.redis.multi();
    pipeline.sadd(USER_SOCKETS_KEY(userId), socketId);
    pipeline.expire(USER_SOCKETS_KEY(userId), TTL_SECONDS);
    pipeline.set(SOCKET_USER_KEY(socketId), userId, 'EX', TTL_SECONDS);
    pipeline.sadd(ONLINE_USERS_KEY, userId);
    const results = await pipeline.exec();
    const count = await this.redis.scard(USER_SOCKETS_KEY(userId));
    void results;
    return count;
  }

  async removeSocket(socketId: string): Promise<{ userId: string | null; remaining: number }> {
    const userId = await this.redis.get(SOCKET_USER_KEY(socketId));
    if (!userId) return { userId: null, remaining: 0 };

    const pipeline = this.redis.multi();
    pipeline.srem(USER_SOCKETS_KEY(userId), socketId);
    pipeline.del(SOCKET_USER_KEY(socketId));
    await pipeline.exec();

    const remaining = await this.redis.scard(USER_SOCKETS_KEY(userId));
    if (remaining === 0) {
      await this.redis.del(USER_SOCKETS_KEY(userId));
      await this.redis.srem(ONLINE_USERS_KEY, userId);
    }
    return { userId, remaining };
  }

  async getSockets(userId: string): Promise<string[]> {
    return this.redis.smembers(USER_SOCKETS_KEY(userId));
  }

  async isOnline(userId: string): Promise<boolean> {
    const count = await this.redis.scard(USER_SOCKETS_KEY(userId));
    return count > 0;
  }

  async getOnlineUsers(): Promise<string[]> {
    return this.redis.smembers(ONLINE_USERS_KEY);
  }

  async getOnlineCount(): Promise<number> {
    return this.redis.scard(ONLINE_USERS_KEY);
  }
}
