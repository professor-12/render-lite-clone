import { randomUUID } from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { createLogger } from '../../libs/logger';
import { renderLiteJobsPublisher } from '../../workers/renderlite-jobs.publisher';
import type { BuildLanguage } from '../../libs/build/build-language';

const logger = createLogger({ module: 'github-webhook' });

/** Subset of the GitHub `push` event payload we rely on. */
interface GithubPushPayload {
  ref?: string;
  deleted?: boolean;
  repository?: {
    full_name?: string;
    clone_url?: string;
    html_url?: string;
    ssh_url?: string;
  };
  head_commit?: {
    id?: string;
    message?: string;
  } | null;
}

/**
 * Normalize a git repo URL/identifier to a comparable form so that
 * https://github.com/owner/repo, the .git variant, the SSH form and the
 * "owner/repo" full_name all collapse to the same key.
 */
function normalizeRepo(value: string | undefined | null): string | null {
  if (!value) return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/^git@github\.com:/, '')
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
}

export class GithubWebhookService {
  constructor(private db = prisma) {}

  /**
   * Routes a verified webhook event to its handler.
   * Returns a short status string describing what was done.
   */
  public async handleEvent(event: string, payload: unknown): Promise<{ handled: boolean; detail: string }> {
    switch (event) {
      case 'ping':
        return { handled: true, detail: 'pong' };
      case 'push':
        return this.handlePush(payload as GithubPushPayload);
      default:
        logger.info({ event }, 'Ignoring unhandled webhook event');
        return { handled: false, detail: `ignored event: ${event}` };
    }
  }

  private async handlePush(payload: GithubPushPayload): Promise<{ handled: boolean; detail: string }> {
    const ref = payload.ref ?? '';

    if (!ref.startsWith('refs/heads/')) {
      logger.info({ ref }, 'Push is not to a branch (tag or other ref); skipping');
      return { handled: false, detail: 'non-branch ref' };
    }

    if (payload.deleted) {
      logger.info({ ref }, 'Branch deletion push; skipping deploy');
      return { handled: false, detail: 'branch deleted' };
    }

    const branch = ref.slice('refs/heads/'.length);
    const repo = payload.repository ?? {};
    const candidateKeys = new Set(
      [repo.full_name, repo.clone_url, repo.html_url, repo.ssh_url]
        .map(normalizeRepo)
        .filter((v): v is string => v !== null),
    );

    if (candidateKeys.size === 0) {
      logger.warn('Push payload had no usable repository identifiers');
      return { handled: false, detail: 'no repository info' };
    }

    // Match on branch in the DB, then filter by normalized repo URL in memory
    // since repoUrl may be stored in any of several equivalent forms.
    const projects = await this.db.project.findMany({ where: { branch } });
    const matched = projects.filter((p) => {
      const key = normalizeRepo(p.repoUrl);
      return key !== null && candidateKeys.has(key);
    });

    if (matched.length === 0) {
      logger.info({ branch, candidateKeys: [...candidateKeys] }, 'No projects matched push');
      return { handled: false, detail: 'no matching project' };
    }

    const commitSha = payload.head_commit?.id;
    const commitMessage = payload.head_commit?.message ?? null;

    for (const project of matched) {
      await this.triggerDeploy(project, commitSha, commitMessage);
    }

    logger.info(
      { branch, deployed: matched.length, commitSha },
      'Push triggered auto-deploys',
    );
    return { handled: true, detail: `queued ${matched.length} deploy(s)` };
  }

  /**
   * Creates a fresh Deployment from the project's current config and publishes
   * a build job — the same flow used by manual create/redeploy, but driven by
   * the push rather than a user request.
   */
  private async triggerDeploy(
    project: Awaited<ReturnType<typeof prisma.project.findMany>>[number],
    commitSha: string | undefined,
    commitMessage: string | null,
  ) {
    const buildLanguage = project.buildLanguage as BuildLanguage;

    const deployment = await this.db.deployment.create({
      data: {
        name: commitSha ? `Push ${commitSha.slice(0, 7)}` : 'Push deploy',
        description: commitMessage,
        repoUrl: project.repoUrl,
        branch: project.branch,
        rootDir: project.rootDir,
        buildLanguage,
        projectType: project.projectType,
        outDir: project.outDir,
        installCommand: project.installCommand,
        buildCommand: project.buildCommand,
        startCommand: project.startCommand,
        env: project.env,
        image: '',
        port: project.port,
        status: 'queued_build',
        projectId: project.id,
        live_url: '',
      },
    });

    await renderLiteJobsPublisher.publishBuildRequested({
      correlationId: randomUUID(),
      requestedByUserId: project.userId,
      requestedAt: new Date().toISOString(),
      deploymentId: deployment.id,
      githubUrl: project.repoUrl,
      installCommand: project.installCommand,
      buildCommand: project.buildCommand,
      buildLanguage,
      projectType: project.projectType,
      outDir: project.outDir ?? undefined,
      rootDir: project.rootDir ?? undefined,
    });

    logger.info(
      { projectId: project.id, deploymentId: deployment.id, commitSha },
      'Auto-deploy queued from push',
    );
  }
}
