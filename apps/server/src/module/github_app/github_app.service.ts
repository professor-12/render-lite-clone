import { prisma } from '../../libs/prisma';
import jwt from 'jsonwebtoken';
export default class GithubAppService {
  constructor() {}

  async createInstallation(installationId: number, code: string) {
    const token = await this.getAppToken();

    const response = await fetch(`https://api.github.com/app/installations/${installationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch installation details: ${response.statusText}`);
    }

    const data = await response.json();

    console.log({ data });

    const installation = await prisma.githubInstallation.create({
      data: {
        installationId: data.id,
        accountLogin: data.account.login,
        accountId: data.account.id,
        accountType: data.account.type,
      },
    });

    return installation;
  }

  async getAppToken() {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iat: now - 60, // issued at time
      exp: now + 10 * 60, // expires in 10 minutes
      iss: process.env.GITHUB_APP_ID, // GitHub App ID
    };

    const token = jwt.sign(payload, process.env.GITHUB_PRIVATE_KEY as string, {
      algorithm: 'RS256',
    });

    return token;
  }
}
