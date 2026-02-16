import type { GithubService } from '../../libs/github-service';
import { prisma } from '../../libs/prisma';
import jwt from 'jsonwebtoken';
import { encrypt, getEnv } from '../../utlis';
import { logger } from '../../middlewares/httplogger.middleware';
export class AuthService {
  constructor(private githubService: GithubService) {}

  public async registerUser({ code }: { code: string }) {
    const accessToken = await this.githubService.getGithubToken(code);

    // 2️⃣ Fetch GitHub user
    const githubUser = await this.githubService.getGithubUser(accessToken);
    logger.debug(githubUser)

    const encryptedToken = encrypt(accessToken);

    // 3️⃣ Check if account already exists
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'GITHUB',
          providerAccountId: String(githubUser.id),
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      // 🔁 Update token + basic profile info
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: 'GITHUB',
            providerAccountId: String(githubUser.id),
          },
        },
        data: {
          accessToken: encryptedToken,
        },
      });

      await prisma.user.update({
        where: { id: existingAccount.user.id },
        data: {
          avatarUrl: githubUser.avatar_url,
          username: githubUser.login,
          name: githubUser.name ?? "",
          email: githubUser.email ?? existingAccount.user.email,
        },
      });

      const jwtToken = this.generateJwt(existingAccount.user.id);

      return {
        user: existingAccount.user,
        token: jwtToken,
      };
    }

    // 4️⃣ Create new user + account
    const newUser = await prisma.user.create({
      data: {
        email: githubUser.email ?? null,
        username: githubUser.login,
        name: githubUser.name ?? "",
        avatarUrl: githubUser.avatar_url,
        accounts: {
          create: {
            provider: 'GITHUB',
            providerAccountId: String(githubUser.id),
            accessToken: encryptedToken,
          },
        },
      },
    });

    const jwtToken = this.generateJwt(newUser.id);

    return {
      user: newUser,
      token: jwtToken,
    };
  }

  
  private generateJwt(userId: string) {
    return jwt.sign({ userId }, getEnv('JWT_SECRET'), { expiresIn: '1d' });
  }
}
