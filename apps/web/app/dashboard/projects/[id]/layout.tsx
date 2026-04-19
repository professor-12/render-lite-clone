'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const tabs = (projectId: string) =>
  [
    { label: 'Deployment', href: `/dashboard/deployments/${projectId}` },
    { label: 'Logs', href: `/dashboard/projects/${projectId}/logs` },
    { label: 'Resources', href: `/dashboard/projects/${projectId}/resources` },
    { label: 'Source', href: `/dashboard/projects/${projectId}/source` },
    { label: 'Open Graph', href: `/dashboard/projects/${projectId}/open-graph` },
  ] as const;

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const base = pathname.split('/dashboard/projects/')[1]?.split('/')?.[0] ?? '';
  const isActive = (href: string) => {
    const full = href ? `/dashboard/projects/${base}/${href}` : `/dashboard/projects/${base}`;
    return pathname === full;
  };

  return (
    <div className="mx-auto w-full p-6">
      <div className="mb-6 border-b border-border/60">
        <nav className="-mb-px flex flex-wrap gap-1">
          {tabs(base as string).map((t) => (
            <Link
              key={t.href}
              href={t.href ? `./${t.href}` : '.'}
              className={`rounded-md px-3 py-2 text-[14px] font- transition-colors hover:bg-muted/60 hover:text-foreground ${
                isActive(t.href) ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}
