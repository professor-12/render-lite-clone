import { randomUUID } from 'node:crypto';
import { prisma } from '../../libs/prisma';
import type { CreateProjectBody } from '../../validators/deploy.validator';
import { logger } from '../../libs/logger';
import { mapProjectToListItem } from '../../utils/project-list.mapper';
import type { BuildLanguage } from '../../libs/build/build-language';
import { renderLiteJobsPublisher } from '../../workers/renderlite-jobs.publisher';

export class DeployServiceService {
  public listProjectsForUser = async (userId: string) => {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        deployments: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { deployments: true },
        },
      },
    });
    return projects.map((p) => mapProjectToListItem(p));
  };

  public getProjectForUser = async (projectId: string, userId: string) => {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: {
        id: true,
        name: true,
        repoUrl: true,
        branch: true,
        rootDir: true,
        outDir: true,
        installCommand: true,
        buildCommand: true,
        startCommand: true,
        domain: true,
        createdAt: true,
        updatedAt: true,
        deployments: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: { select: { deployments: true } },
      },
    });

    if (!project) return null;

    const latestDeployment = project.deployments[0] ?? null;
    return {
      id: project.id,
      name: project.name,
      repoUrl: project.repoUrl,
      branch: project.branch,
      rootDir: project.rootDir,
      outDir: project.outDir,
      installCommand: project.installCommand,
      buildCommand: project.buildCommand,
      startCommand: project.startCommand,
      domain: project.domain,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      latestDeployment,
      deploymentsCount: project._count.deployments,
    };
  };

  public getDeploymentForUser = async (deploymentId: string, userId: string) => {
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        project: { userId },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { id: true, name: true } },
      },
    });

    return deployment;
  };

  public getDeploymentLogsForUser = async (
    deploymentId: string,
    userId: string,
    cursor?: string,
  ) => {
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        project: { userId },
      },
      select: { id: true, status: true, updatedAt: true },
    });
    if (!deployment) return null;

    const logs = await prisma.deploymentLog.findMany({
      where: { deploymentId },
      orderBy: { createdAt: 'asc' },
      take: 250,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        type: true,
        log: true,
        createdAt: true,
      },
    });

    return { deployment, logs };
  };

  public createProject = async (validatedData: CreateProjectBody, userId: string) => {
    const buildLanguage: BuildLanguage = validatedData.useDockerCommands
      ? 'docker'
      : (validatedData.buildLanguage as BuildLanguage);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name.trim(),
        repoUrl: validatedData.gitUrl.trim(),
        branch: validatedData.branch.trim(),
        rootDir: validatedData.rootDir.trim(),
        buildLanguage,
        outDir: validatedData.outDir?.trim() || null,
        installCommand: validatedData.installCommand.trim(),
        buildCommand: validatedData.buildCommand.trim(),
        startCommand: validatedData.startCommand.trim(),
        env: validatedData.env,
        image: '',
        port: 3000,
        userId,
      },
    });

    const deployment = await prisma.deployment.create({
      data: {
        name: 'Production',
        description: validatedData.description?.trim() || null,
        repoUrl: project.repoUrl,
        branch: project.branch,
        rootDir: project.rootDir,
        buildLanguage,
        outDir: project.outDir,
        installCommand: project.installCommand,
        buildCommand: project.buildCommand,
        startCommand: project.startCommand,
        env: project.env,
        image: '',
        port: project.port,
        status: 'queued_build',
        projectId: project.id,
      },
    });

    const job = {
      correlationId: randomUUID(),
      requestedByUserId: userId,
      requestedAt: new Date().toISOString(),
      deploymentId: deployment.id,
      githubUrl: project.repoUrl,
      installCommand: project.installCommand,
      buildCommand: project.buildCommand,
      buildLanguage,
      outDir: project.outDir ?? undefined,
      rootDir: project.rootDir ?? undefined,
    };

    await renderLiteJobsPublisher.publishBuildRequested(job);
    logger.info({ projectId: project.id, deploymentId: deployment.id }, 'Build queued');
    return {
      projectId: project.id,
      deploymentId: deployment.id,
      status: deployment.status,
    };
  };
}
