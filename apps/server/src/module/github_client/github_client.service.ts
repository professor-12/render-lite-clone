import jwt from 'jsonwebtoken';
import { AppError } from '../../errors/Apperror';
import { logger } from '../../libs/logger';
import type {
  GithubInstallationReposResponse,
  GithubInstallationResponse,
  GithubInstallationTokenResponse,
  GithubRepository,
  GithubTokenResponse,
  GithubUserData,
  GithubUserResponse,
} from '../../types/github.types';

const GITHUB_API = 'https://api.github.com';
const API_VERSION = '2022-11-28';
export interface GithubRepositoryContentResponse {
  path: string;
  url: string;
}

export class GithubClientService {
  private readonly oauthTokenUrl = 'https://github.com/login/oauth/access_token';

  private requireAppCredentials() {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!appId || !privateKey) {
      throw new AppError('GitHub App is not configured', 500);
    }
    return { appId, privateKey };
  }

  private signAppJwt(): string {
    const { appId, privateKey } = this.requireAppCredentials();
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({ iss: appId, iat: now - 60, exp: now + 10 * 60 }, privateKey, {
      algorithm: 'RS256',
    });
  }

  private async githubFetch<T>(
    url: string,
    token: string,
    tokenType: 'Bearer' | 'token' = 'Bearer',
  ): Promise<T> {
    const res = await fetch(url, {
      headers: {
        Authorization: `${tokenType} ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn({ status: res.status, url, body }, 'GitHub API request failed');
      throw new AppError(`GitHub API error (${res.status})`, res.status);
    }

    return res.json() as Promise<T>;
  }

  private async getInstallationToken(installationId: number): Promise<string> {
    const appJwt = this.signAppJwt();
    const url = `${GITHUB_API}/app/installations/${installationId}/access_tokens`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.warn({ status: res.status, installationId, body }, 'Failed to get installation token');
      throw new AppError('Failed to get GitHub installation token', 502);
    }

    const data = (await res.json()) as GithubInstallationTokenResponse;
    return data.token;
  }

  public async exchangeOAuthCodeForToken(code: string): Promise<string> {
    if (!code) {
      throw new AppError('Authorization code is required', 400);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      logger.error('GitHub OAuth environment variables missing');
      throw new AppError('OAuth configuration error', 500);
    }

    try {
      const response = await fetch(this.oauthTokenUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'GitHub token request failed');
        throw new AppError('Failed to fetch GitHub token', 502);
      }

      const data = (await response.json()) as GithubTokenResponse;

      if (data.error) {
        logger.warn(
          { error: data.error, description: data.error_description },
          'GitHub OAuth error',
        );
        throw new AppError(data.error_description || 'GitHub authentication failed', 401);
      }

      if (!data.access_token) {
        throw new AppError('Invalid GitHub token response', 500);
      }

      logger.info('GitHub token successfully retrieved');
      return data.access_token;
    } catch (error) {
      logger.error({ err: error }, 'Unexpected GitHub OAuth error');
      throw error;
    }
  }

  public async getAuthenticatedUser(oauthToken: string): Promise<GithubUserData> {
    try {
      const data = await this.githubFetch<GithubUserResponse>(
        `${GITHUB_API}/user`,
        oauthToken,
        'token',
      );
      logger.debug({ githubUser: { id: data.id, login: data.login } }, 'GitHub user fetched');

      return {
        id: data.id,
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name ?? '',
        email: data.email ?? null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.warn({ err: error }, 'GitHub user fetch failed');
      throw new AppError('Failed to fetch GitHub user', 502);
    }
  }

  public async getAppInstallation(installationId: number): Promise<GithubInstallationResponse> {
    logger.debug({ installationId }, 'Getting app installation');
    const appJwt = this.signAppJwt();
    return this.githubFetch<GithubInstallationResponse>(
      `${GITHUB_API}/app/installations/${installationId}`,
      appJwt,
    );
  }

  public async listInstallationRepositories(
    installationId: number,
    repoNameQuery: string,
  ): Promise<GithubRepository[]> {
    const token = await this.getInstallationToken(installationId);
    const q = (repoNameQuery ?? '').toLowerCase();
    const allRepos: GithubRepository[] = [];

    let page = 1;
    const perPage = 100;
    while (true) {
      const data = await this.githubFetch<GithubInstallationReposResponse>(
        `${GITHUB_API}/installation/repositories?per_page=${perPage}&page=${page}`,
        token,
      );
      allRepos.push(...data.repositories);
      if (data.repositories.length < perPage) {
        break;
      }
      page += 1;
    }

    logger.info({ total: allRepos.length, installationId }, 'Installation repositories loaded');

    if (!q) {
      return allRepos;
    }

    return allRepos.filter((repo) => repo.name.toLowerCase().includes(q));
  }

  public async getRepository({
    installationId,
    repoName,
    owner,
  }: {
    installationId: number;
    repoName: string;
    owner: string;
  }): Promise<GithubRepository> {
    const accessToken = await this.getInstallationToken(installationId);
    const url = `${GITHUB_API}/repos/${owner}/${repoName}`;
    return this.githubFetch<GithubRepository>(url, accessToken);
  }

  public async getBuildCommand({
    installationId,
    repoName,
    branch,
    rootDir,
    owner,
  }: {
    installationId: number;
    repoName: string;
    branch: string;
    rootDir: string;
    owner: string;
  }): Promise<BuildResult> {
    const accessToken = await this.getInstallationToken(installationId);
    const url = `${GITHUB_API}/repos/${owner}/${repoName}/contents/${rootDir}`;
    const data = await this.githubFetch<GithubRepositoryContentResponse[]>(url, accessToken);
    logger.debug({ data }, 'Repository contents fetched');
    const files = data.map((file) => ({
      name: file.path.split('/').pop() ?? '',
      path: file.path,
      type: file.path.endsWith('/') ? 'dir' : 'file',
      download_url: file.url,
    })) as unknown as RepoFile[];
    const buildCommand = await getBuildCommand(files, (url) => this.githubFetch(url, accessToken));
    return buildCommand;
  }
}

type RepoFile = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
};

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type BuildResult = {
  installCommand: string;
  buildCommand: string;
  startCommand: string;
  runtime: string;
  framework?: string;
  reason: string[];
};

export async function getBuildCommand(
  files: RepoFile[],
  fetchFileContent: (url: string) => Promise<any>,
): Promise<BuildResult> {
  const names = new Set(files.map((f) => f.name.toLowerCase()));
  const get = (name: string) => files.find((f) => f.name.toLowerCase() === name.toLowerCase());

  const reason: string[] = [];

  // -------------------------
  // 1. Docker (absolute priority)
  // -------------------------
  if (names.has('dockerfile')) {
    return {
      installCommand: '',
      buildCommand: 'docker build -t app .',
      startCommand: 'docker run -p 3000:3000 app',
      runtime: 'docker',
      reason: ['Dockerfile detected'],
    };
  }

  // -------------------------
  // 2. Node.js detection
  // -------------------------
  if (names.has('package.json')) {
    const pkgFile = get('package.json');

    let pkg: PackageJson = {};
    if (pkgFile?.download_url) {
      pkg = await fetchFileContent(pkgFile.download_url);
      reason.push('package.json parsed');
    }

    // detect package manager
    let pm = 'npm';
    if (names.has('pnpm-lock.yaml')) pm = 'pnpm';
    else if (names.has('yarn.lock')) pm = 'yarn';

    const install = pm === 'pnpm' ? 'pnpm install' : pm === 'yarn' ? 'yarn install' : 'npm install';

    // -------------------------
    // framework detection (deps-based)
    // -------------------------
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    let framework: string | undefined;

    if (deps?.next) framework = 'nextjs';
    else if (deps?.react) framework = 'react';
    else if (deps?.vue) framework = 'vue';
    else if (deps?.['@nestjs/core']) framework = 'nestjs';
    else if (deps?.express) framework = 'express';
    else if (deps?.fastify) framework = 'fastify';

    if (framework) {
      reason.push(`Framework detected: ${framework}`);
    }

    // -------------------------
    // scripts (MOST IMPORTANT)
    // -------------------------
    const scripts = pkg.scripts || {};

    let build = '';
    let start = '';

    if (scripts.build) {
      build = `${pm} run build`;
      reason.push('Using package.json build script');
    }

    if (scripts.start) {
      start = `${pm} run start`;
      reason.push('Using package.json start script');
    }

    // -------------------------
    // monorepo / turbo
    // -------------------------
    if (names.has('turbo.json')) {
      build = `${pm} turbo build`;
      start = `${pm} turbo start`;
      reason.push('Turborepo detected');
    }

    // -------------------------
    // framework overrides
    // -------------------------
    if (framework === 'nextjs') {
      build = `${pm} build`;
      start = `${pm} start`;
    }

    if (framework === 'react' && !scripts.start) {
      start = `${pm} run dev`;
    }

    // fallback
    if (!build) {
      build = `${pm} run build`;
      reason.push('Fallback build command');
    }

    if (!start) {
      start = `${pm} start`;
      reason.push('Fallback start command');
    }

    return {
      installCommand: install,
      buildCommand: build,
      startCommand: start,
      runtime: 'node',
      framework,
      reason,
    };
  }

  // -------------------------
  // 3. Python detection
  // -------------------------
  if (names.has('requirements.txt') || names.has('pyproject.toml')) {
    reason.push('Python project detected');

    return {
      installCommand: 'pip install -r requirements.txt',
      buildCommand: '',
      startCommand: 'python app.py',
      runtime: 'python',
      reason,
    };
  }

  // -------------------------
  // 4. Go detection
  // -------------------------
  if (names.has('go.mod')) {
    reason.push('Go project detected');

    return {
      installCommand: 'go mod download',
      buildCommand: 'go build -o app',
      startCommand: './app',
      runtime: 'go',
      reason,
    };
  }

  // -------------------------
  // 5. Ruby detection
  // -------------------------
  if (names.has('Gemfile')) {
    reason.push('Ruby project detected');
    return {
      installCommand: 'bundle install',
      buildCommand: '',
      startCommand: 'bundle exec ruby app.rb',
      runtime: 'ruby',
      reason,
    };
  }

  // -------------------------
  // 6. PHP detection
  // -------------------------
  if (names.has('composer.json')) {
    reason.push('PHP project detected');
    return {
      installCommand: 'composer install',
      buildCommand: '',
      startCommand: 'php -S 0.0.0.0:8000 public/index.php',
      runtime: 'php',
      reason,
    };
  }

  // -------------------------
  // 7. Rust detection
  // -------------------------
  if (names.has('Cargo.toml')) {
    reason.push('Rust project detected');
    return {
      installCommand: 'cargo install',
      buildCommand: 'cargo build',
      startCommand: './target/debug/app',
      runtime: 'rust',
      reason,
    };
  }

  // -------------------------
  // 8. Elixir detection
  // -------------------------
  if (names.has('mix.exs')) {
    reason.push('Elixir project detected');
    return {
      installCommand: 'mix deps.get',
      buildCommand: 'mix compile',
      startCommand: 'mix run --no-halt',
      runtime: 'elixir',
      reason,
    };
  }

  // -------------------------
  // 9. Kotlin detection
  // -------------------------
  if (names.has('build.gradle')) {
    reason.push('Kotlin project detected');
    return {
      installCommand: 'gradle build',
      buildCommand: 'gradle build',
      startCommand: 'gradle run',
      runtime: 'kotlin',
      reason,
    };
  }

  // -------------------------
  // 10. Swift detection
  // -------------------------
  if (names.has('Package.swift')) {
    reason.push('Swift project detected');
    return {
      installCommand: 'swift build',
      buildCommand: 'swift build',
      startCommand: 'swift run',
      runtime: 'swift',
      reason,
    };
  }

  // -------------------------
  // 11. Dart detection
  // -------------------------
  if (names.has('pubspec.yaml')) {
    reason.push('Dart project detected');
    return {
      installCommand: 'flutter pub get',
      buildCommand: 'flutter build',
      startCommand: 'flutter run',
      runtime: 'dart',
      reason,
    };
  }

  // -------------------------
  // 12. Scala detection
  // -------------------------
  if (names.has('build.sbt')) {
    reason.push('Scala project detected');
    return {
      installCommand: 'sbt build',
      buildCommand: 'sbt build',
      startCommand: 'sbt run',
      runtime: 'scala',
      reason,
    };
  }

  // -------------------------
  // 13. Haskell detection
  // -------------------------
  if (names.has('stack.yaml')) {
    reason.push('Haskell project detected');
    return {
      installCommand: 'stack build',
      buildCommand: 'stack build',
      startCommand: 'stack run',
      runtime: 'haskell',
      reason,
    };
  }

  return {
    installCommand: '',
    buildCommand: '',
    startCommand: '',
    runtime: 'unknown',
    reason: ['Could not detect project type'],
  };
}
