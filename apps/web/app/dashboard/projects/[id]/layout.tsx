'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const tabs = (projectId: string) =>
  [
    { label: 'Overview', href: `/dashboard/projects/${projectId}` },
    { label: 'Deployments', href: `/dashboard/deployments/${projectId}` },
    { label: 'Logs', href: `/dashboard/projects/${projectId}/logs` },
    { label: 'Resources', href: `/dashboard/projects/${projectId}/resources` },
    { label: 'Source', href: `/dashboard/projects/${projectId}/source` },
    { label: 'Settings', href: `/dashboard/projects/${projectId}/settings` },
  ] as const;

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const base = pathname.split('/dashboard/projects/')[1]?.split('/')?.[0] ?? '';

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
          {tabs(base as string).map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative whitespace-nowrap rounded-t-md px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  active
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
