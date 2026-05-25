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
    projectType: 'dynamic',
  });
  const [projectTypeTouched, setProjectTypeTouched] = useState(false);

  const { data: detectServiceData, isPending, isError } = useDetectService(form.gitUrl);
  const {
    mutate: createProject,
    isPending: isCreatingProject,
    isSuccess: isProjectCreated,
    error: createProjectError,
    data: createdProject,
  } = useCreateProject();

  useEffect(() => {
    if (!detectServiceData?.buildCommand) return;
    const bc = detectServiceData.buildCommand;
    const bl = detectServiceData.buildLanguage;
    const suggestedType = detectServiceData.projectType ?? bc.projectType;
    setForm((prev) => ({
      ...prev,
      installCommand: bc.installCommand ?? '',
      buildCommand: bc.buildCommand ?? prev.buildCommand,
      startCommand: bc.startCommand ?? prev.startCommand,
      outDir: (prev.outDir?.trim() ? prev.outDir : (bc.outDir ?? prev.outDir)),
      useDockerCommands: bc.runtime === 'docker',
      buildLanguage: bl ?? (bc.runtime === 'docker' ? 'docker' : 'javascript'),
      projectType: projectTypeTouched ? prev.projectType : (suggestedType ?? prev.projectType),
    }));
  }, [detectServiceData, projectTypeTouched]);

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
    if (field === 'projectType') setProjectTypeTouched(true);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeploy = () => {
    if (!canDeploy) return;
    createProject(form);
  };

  useEffect(() => {
    if (!createdProject?.deploymentId) return;
    
    router.push(`/dashboard/deployments/${createdProject.deploymentId}`);
  }, [createdProject?.deploymentId, router]);

  const detectedBuild = detectServiceData?.buildCommand;

  return (
    <div className="min-h-screen bg-black pt-12 text-brand-cream">
      <ImportHeader />

      <main className="relative min-h-screen overflow-hidden bg-black py-12 pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full warm-glow opacity-40" />
        <div className="relative z-10 mx-auto w-full max-w-2xl px-6">
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
