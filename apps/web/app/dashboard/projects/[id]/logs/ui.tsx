'use client';

import Link from 'next/link';
import { Terminal, ArrowUpRight } from 'lucide-react';
import { useGetProject } from '@/app/queries/projects.query';

export default function ProjectLogsClient({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useGetProject(projectId);
  const deploymentId = project?.latestDeployment?.id ?? null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-[var(--brand-orange)]">
        <Terminal className="h-5 w-5" />
      </div>
      <h3 className="text-[16px] font-medium tracking-tight text-foreground">
        Build & runtime logs
      </h3>
      <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        {isLoading
          ? 'Loading…'
          : deploymentId
            ? 'Stream build and runtime output from the latest deployment.'
            : 'No deployments yet — connect a repository to ship your first build.'}
      </p>
      <div className="mt-5">
        {deploymentId ? (
          <Link
            href={`/dashboard/deployments/${deploymentId}`}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-all hover:opacity-90"
          >
            Open build logs
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
        ) : (
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back to projects
          </Link>
        )}
      </div>
    </div>
  );
}
