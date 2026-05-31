'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useGetProject } from '@/app/queries/projects.query';

type Tab = { label: string; href: string };

// This layout is scoped to a single project, so every project-level tab is keyed by
// `projectId`. The only deployment-scoped destination is the Deployments tab, which points
// at the project's latest deployment; it's omitted entirely until a deployment exists so we
// never link to `/dashboard/deployments/undefined`.
const buildTabs = (projectId: string, deploymentId: string | null): Tab[] => {
  const tabs: Tab[] = [{ label: 'Overview', href: `/dashboard/projects/${projectId}` }];

  if (deploymentId) {
    tabs.push({ label: 'Deployments', href: `/dashboard/deployments/${deploymentId}` });
  }

  tabs.push(
    { label: 'Logs', href: `/dashboard/projects/${projectId}/logs` },
    { label: 'Resources', href: `/dashboard/projects/${projectId}/resources` },
    { label: 'Source', href: `/dashboard/projects/${projectId}/source` },
    { label: 'Settings', href: `/dashboard/projects/${projectId}/settings` },
  );

  return tabs;
};

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const projectId = params?.id ?? '';
  const { data: project } = useGetProject(projectId);
  const deploymentId = project?.latestDeployment?.id ?? null;

  const tabs = buildTabs(projectId, deploymentId);

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative whitespace-nowrap rounded-t-md px-3 py-2.5 text-[13px] font-medium transition-colors ${active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--brand-orange)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
