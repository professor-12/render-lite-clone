import { randomUUID } from 'node:crypto';
import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { prisma } from '../libs/prisma';
import { runBuildJobAndUpload } from '../libs/build/build-job';
import { isBuildLanguage, type BuildLanguage } from '../libs/build/build-language';
import { BaseWorker } from './base.worker';
import { type BuildRequestedJob, RenderLiteQueue } from './contracts';
import { renderLiteJobsPublisher } from './renderlite-jobs.publisher';

export class BuildWorker extends BaseWorker<BuildRequestedJob> {
  protected readonly queueName = RenderLiteQueue.BUILD_REQUESTED;
  protected readonly workerName = 'BuildWorker';

  protected async process(payload: BuildRequestedJob, _rawMessage: ConsumeMessage): Promise<void> {
    const { deploymentId, correlationId } = payload;

    logger.info({ deploymentId, correlationId }, 'Build job started');

    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    if (!deployment) {
      logger.warn({ deploymentId, correlationId }, 'Build job skipped: deployment not found');
      return;
    }

    const appendLog = async (type: 'stdout' | 'stderr', chunk: string) => {
      const trimmed = chunk.toString();
      if (!trimmed) return;
      // Keep rows reasonably sized.
      const parts =
        trimmed.length > 4000 ? [trimmed.slice(0, 4000), trimmed.slice(4000)] : [trimmed];
      for (const p of parts) {
        const logs = await prisma.deploymentLog.create({
          data: {
            deploymentId,
            type,
            log: p,
          },
        });

        logger.info({ logs }, 'Log created');
      }
    };

    try {
      await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'building' } });

      const buildLanguage: BuildLanguage = isBuildLanguage(payload.buildLanguage)
        ? payload.buildLanguage
        : isBuildLanguage(deployment.buildLanguage)
          ? deployment.buildLanguage
          : 'javascript';

      const result = await runBuildJobAndUpload({
        githubUrl: payload.githubUrl,
        branch: deployment.branch,
        rootDir: payload.rootDir ?? deployment.rootDir,
        installCommand: payload.installCommand,
        buildCommand: payload.buildCommand,
        outDir: payload.outDir,
        buildLanguage,
        onStdout: (c) => void appendLog('stdout', c),
        onStderr: (c) => void appendLog('stderr', c),
      });

      const updatedDeployment = await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'queued_deploy',
          image: result.artifactUrl,
        },
        select: { projectId: true, startCommand: true, rootDir: true, outDir: true, env: true, port: true },
      });
      appendLog("stdout", "Build successfully done 🥳🙌🏽")
      appendLog("stdout", "Publishing your deployment... 🚀")

      const deployJob = {
        correlationId: correlationId ?? randomUUID(),
        requestedAt: new Date().toISOString(),
        projectId: updatedDeployment.projectId,
        deploymentId,
        artifactUrl: result.artifactUrl,
        artifactKey: result.artifactKey,
        artifactKind: result.artifactKind,
        buildLanguage,
        startCommand: updatedDeployment.startCommand,
        rootDir: updatedDeployment.rootDir,
        outDir: updatedDeployment.outDir,
        runtime: {
          containerPort: updatedDeployment.port,
          env: updatedDeployment.env,
        },
      }
      await renderLiteJobsPublisher.publishDeployRequested(deployJob);
      logger.info(
        { deploymentId, correlationId, artifactKind: result.artifactKind },
        'Build job finished, deploy enqueued',
      );
    } catch (err) {
      logger.error({ err, deploymentId, correlationId }, 'Build job failed');
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'build_failed' },
      });
      await appendLog(
        'stderr',
        `\nBuild failed: ${err instanceof Error ? err.message : String(err)}\n`,
      );
      throw err;
    }
  }
}
