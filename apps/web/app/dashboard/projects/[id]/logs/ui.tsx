'use client';

import Link from 'next/link';
import { useGetProject } from '@/app/queries/projects.query';

export default function ProjectLogsClient({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useGetProject(projectId);
  const deploymentId = project?.latestDeployment?.id ?? null;

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="text-[13px] font-medium text-foreground">Logs</div>
      <p className="mt-1 text-[13px] text-[#a3a3a3]">
        {isLoading
          ? 'Loading…'
          : deploymentId
            ? 'Open build logs for the latest deployment.'
            : 'No deployments yet.'}
      </p>
      <div className="mt-4">
        {deploymentId ? (
          <Link
            href={`/dashboard/deployments/${deploymentId}`}
            className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Open build logs
          </Link>
        ) : (
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Back to projects
          </Link>
        )}
      </div>
    </div>
  );
}

