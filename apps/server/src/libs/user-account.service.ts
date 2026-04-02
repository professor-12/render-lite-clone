import type { Account, GithubInstallation, PrismaClient, User } from '../generated/prisma/client';
import { AppError } from '../errors/Apperror';
import { prisma } from './prisma';
import { logger } from './logger';

export type UserWithAccounts = User & {
  accounts: (Account & { githubInstallations: GithubInstallation[] })[];
};

export class UserAccountService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getUserWithAccounts(userId: string): Promise<UserWithAccounts> {
    logger.debug({ userId }, 'Getting user with accounts');
    const id = userId?.trim();
    if (!id) {
      throw new AppError('User id is required', 400);
    }

    try {
      const user = (await this.db.user.findUnique({
        where: { id },
        include: { accounts: { include: { githubInstallations: true } } },
      })) as unknown as UserWithAccounts;
      if (!user) {
        throw new AppError('User not found', 401);
      }
      logger.debug({ user }, 'User with accounts loaded');

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to load user account', 500);
    }
  }
}

export const userAccountService = new UserAccountService();
