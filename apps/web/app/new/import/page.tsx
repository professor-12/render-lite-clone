'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DeployProjectFooter } from './_components/DeployProjectFooter';
import { ImportDeployForm, type ImportFormState } from './_components/ImportDeployForm';
import { ImportHeader } from './_components/ImportHeader';
import { ImportPageIntro } from './_components/ImportPageIntro';
import { RepositorySummary } from './_components/RepositorySummary';

export default function ImportPage() {
  const searchParams = useSearchParams();

  const repoName = searchParams.get('repo') ?? '';
  const repoUrl = searchParams.get('url') ?? '';
  const [form, setForm] = useState<ImportFormState>({
    name: repoName,
    gitUrl: repoUrl,
    branch: 'main',
    rootDir: './',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
  });
  const [buildCommand, setBuildCommand] = useState<string>('');

  useEffect(() => {
    const fetchBuildCommand = async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/detect-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ githubUrl: form.gitUrl }),
        credentials: 'include',
      });
      console.log(response);
      const data = await response.json();
      setBuildCommand(data.buildCommand);
      setForm((prev) => ({ ...prev, buildCommand: data.buildCommand }));
    };
    fetchBuildCommand();
  }, [form.gitUrl]);

  const [deploying, setDeploying] = useState(false);

  const canDeploy = form.name.trim().length > 0 && form.gitUrl.trim().length > 0;

  const updateField = <K extends keyof ImportFormState>(field: K, value: ImportFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeploy = () => {
    if (!canDeploy) return;
    setDeploying(true);
  };

  return (
    <div className="min-h-screen pt-12 bg-[#0a0a0a]">
      <ImportHeader />

      <main className="bg-[#0a0a0a] min-h-screen py-12 pt-20">
        <div className="max-w-2xl w-full mx-auto px-6">
          <ImportPageIntro />

          <RepositorySummary gitUrl={form.gitUrl} branch={form.branch} />

          <ImportDeployForm state={form} onChange={updateField} />

          <DeployProjectFooter
            canDeploy={canDeploy}
            deploying={deploying}
            onDeploy={handleDeploy}
          />
        </div>
      </main>
    </div>
  );
}
