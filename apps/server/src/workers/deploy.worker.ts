import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { prisma } from '../libs/prisma';
import { isBuildLanguage, type BuildLanguage } from '../libs/build/build-language';
import { deployArtifact } from '../libs/deploy/deploy-job';
import { BaseWorker } from './base.worker';
import { type DeployRequestedJob, RenderLiteQueue } from './contracts';
import { socketService } from '../module/socket';

export class DeployWorker extends BaseWorker<DeployRequestedJob> {
  protected readonly queueName = RenderLiteQueue.DEPLOY_REQUESTED;
  protected readonly workerName = 'DeployWorker';

  protected async process(payload: DeployRequestedJob, _rawMessage: ConsumeMessage): Promise<void> {
    const { deploymentId, projectId, correlationId } = payload;

    logger.info(
      {
        deploymentId,
        projectId,
        artifactKind: payload.artifactKind,
        containerPort: payload.runtime.containerPort,
        correlationId,
      },
      'Deploy job started',
    );

    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } });
    if (!deployment) {
      logger.warn({ deploymentId, correlationId }, 'Deploy job skipped: deployment not found');
      return;
    }

    const appendLog = async (type: 'stdout' | 'stderr', chunk: string) => {
      const trimmed = chunk.toString();
      if (!trimmed) return;
      const parts =
        trimmed.length > 4000 ? [trimmed.slice(0, 4000), trimmed.slice(4000)] : [trimmed];
      for (const p of parts) {
        await prisma.deploymentLog.create({
          data: { deploymentId, type, log: p },
        });
        try {
          socketService.emitToDeployment(deploymentId, 'deployment:log', {
            deploymentId,
            type,
            chunk: p,
          });
        } catch {}
      }
    };

    const setStatus = async (status: string) => {
      await prisma.deployment.update({ where: { id: deploymentId }, data: { status } });
      try {
        socketService.emitToDeployment(deploymentId, 'deployment:status', { deploymentId, status });
        socketService.emitToProject(projectId, 'project:updated', { projectId });
      } catch {}
    };

    try {
      await setStatus('deploying');

      const buildLanguage: BuildLanguage = isBuildLanguage(payload.buildLanguage)
        ? payload.buildLanguage
        : isBuildLanguage(deployment.buildLanguage)
          ? deployment.buildLanguage
          : 'javascript';

      const result = await deployArtifact({
        projectId,
        deploymentId,
        artifactUrl: payload.artifactUrl,
        artifactKey: payload.artifactKey,
        artifactKind: payload.artifactKind,
        buildLanguage,
        projectType: payload.projectType ?? deployment.projectType,
        startCommand: payload.startCommand,
        rootDir: payload.rootDir ?? deployment.rootDir,
        outDir: payload.outDir ?? deployment.outDir,
        containerPort: payload.runtime.containerPort,
        env: payload.runtime.env,
        onStdout: (c) => void appendLog('stdout', c),
        onStderr: (c) => void appendLog('stderr', c),
      });

      await setStatus('live');

      // Persist the host port on the project so the proxy/domain layer can route to it.
      if (result.hostPort != null) {
        await prisma.project.update({
          where: { id: projectId },
          data: { port: result.hostPort },
        });
      }

      logger.info(
        {
          deploymentId,
          projectId,
          correlationId,
          containerId: result.containerId,
          hostPort: result.hostPort,
        },
        'Deploy job finished',
      );
    } catch (err) {
      logger.error({ err, deploymentId, projectId, correlationId }, 'Deploy job failed');
      await setStatus('deploy_failed');
      await appendLog(
        'stderr',
        `\nDeploy failed: ${err instanceof Error ? err.message : String(err)}\n`,
      );
      throw err;
    }
  }
}