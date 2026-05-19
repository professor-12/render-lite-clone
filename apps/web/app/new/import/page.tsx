'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useCreateProject, useDetectService } from '@/app/queries/github.query';
import { DeployProjectFooter } from './_components/DeployProjectFooter';
import { ImportBuildMetadataSkeleton } from './_components/ImportBuildMetadataSkeleton';
import { ImportDeployForm, type ImportFormState } from './_components/ImportDeployForm';
import { ImportDetectServiceError } from './_components/ImportDetectServiceError';
import { ImportHeader } from './_components/ImportHeader';
import { ImportPageIntro } from './_components/ImportPageIntro';
import { RepositorySummary } from './_components/RepositorySummary';

export default function ImportPage() {
  return (
    <Suspense fallback={<ImportBuildMetadataSkeleton />}>
      <ImportPageSuspense />
    </Suspense>
  );
}

export function ImportPageSuspense() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const repoName = searchParams.get('repo') ?? '';
  const repoUrl = searchParams.get('url') ?? '';

  const [form, setForm] = useState<ImportFormState>({
    name: repoName,
    gitUrl: repoUrl,
    branch: 'main',
    rootDir: './',
    outDir: '',
    installCommand: '',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    useDockerCommands: false,
    buildLanguage: 'javascript',
  });

  const { data: detectServiceData, isPending, isError } = useDetectService(form.gitUrl);
  const {
    mutate: createProject,
    isPending: isCreatingProject,
    isSuccess: isProjectCreated,
    error: createProjectError,
    data: createdProject,
  } = useCreateProject(form);

  useEffect(() => {
    if (!detectServiceData?.buildCommand) return;
    const bc = detectServiceData.buildCommand;
    const bl = detectServiceData.buildLanguage;
    setForm((prev) => ({
      ...prev,
      installCommand: bc.installCommand ?? '',
      buildCommand: bc.buildCommand ?? prev.buildCommand,
      startCommand: bc.startCommand ?? prev.startCommand,
      outDir: (prev.outDir?.trim() ? prev.outDir : (bc.outDir ?? prev.outDir)),
      useDockerCommands: bc.runtime === 'docker',
      buildLanguage: bl ?? (bc.runtime === 'docker' ? 'docker' : 'javascript'),
    }));
  }, [detectServiceData]);

  const handleUseDockerCommandsChange = useCallback(
    (useDocker: boolean) => {
      if (!detectServiceData?.buildCommand) return;
      const bc = detectServiceData.buildCommand;
      setForm((prev) => ({
        ...prev,
        useDockerCommands: useDocker,
        ...(useDocker
          ? {
              installCommand: bc.installCommand ?? '',
              buildCommand: bc.buildCommand ?? '',
              startCommand: bc.startCommand ?? '',
              buildLanguage: 'docker',
            }
          : {
              installCommand: 'npm install',
              buildCommand: 'npm run build',
              startCommand: 'npm start',
              buildLanguage: detectServiceData.buildLanguage ?? 'javascript',
            }),
      }));
    },
    [detectServiceData],
  );

  const canDeploy = form.name.trim().length > 0 && form.gitUrl.trim().length > 0;
  const hasRepoUrl = form.gitUrl.trim().length > 0;

  const updateField = <K extends keyof ImportFormState>(field: K, value: ImportFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeploy = () => {
    if (!canDeploy) return;
    createProject();
  };

  useEffect(() => {
    if (!createdProject?.deploymentId) return;
    
    router.push(`/dashboard/deployments/${createdProject.deploymentId}`);
  }, [createdProject?.deploymentId, router]);

  const detectedBuild = detectServiceData?.buildCommand;

  return (
    <div className="min-h-screen pt-12 bg-[#0a0a0a]">
      <ImportHeader />

      <main className="bg-[#0a0a0a] min-h-screen py-12 pt-20">
        <div className="max-w-2xl w-full mx-auto px-6">
          <ImportPageIntro />

          <RepositorySummary gitUrl={form.gitUrl} branch={form.branch} />

          {hasRepoUrl && isPending && <ImportBuildMetadataSkeleton />}
          {hasRepoUrl && isError && !isPending && <ImportDetectServiceError />}
          {detectedBuild && (
            <>
              <ImportDeployForm
                state={form}
                onChange={updateField}
                detectedBuild={detectedBuild}
                onUseDockerCommandsChange={handleUseDockerCommandsChange}
              />
              <DeployProjectFooter
                canDeploy={canDeploy}
                deploying={isCreatingProject}
                onDeploy={handleDeploy}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
