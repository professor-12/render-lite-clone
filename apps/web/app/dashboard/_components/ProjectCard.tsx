'use client';

import Link from 'next/link';
import { GitBranch, MoreVertical, Check, Loader2 } from 'lucide-react';
import type { ProjectListItem, ProjectStack, ProjectStatus } from '@/lib/projects/types';
import { SiGithub, SiNextdotjs, SiNodedotjs, SiVercel, SiVuedotjs } from 'react-icons/si';

export type { ProjectListItem, ProjectStack, ProjectStatus } from '@/lib/projects/types';

function StackIcon({ stack }: { stack: ProjectStack }) {
  const common = 'h-5 w-5';
  switch (stack) {
    case 'next':
      return <SiNextdotjs className={`${common} text-foreground`} aria-hidden />;
    case 'vue':
      return <SiVuedotjs className={`${common} text-[#42b883]`} aria-hidden />;
    case 'vercel':
      return <SiVercel className={`${common} text-foreground`} aria-hidden />;
    case 'node':
      return <SiNodedotjs className={`${common} text-[#3c873a]`} aria-hidden />;
    default:
      return <SiVercel className={`${common} text-foreground`} aria-hidden />;
  }
}

function truncateRepo(path: string, max = 32) {
  if (path.length <= max) return path;
  return `${path.slice(0, max - 1)}…`;
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/[0.12] px-2 py-0.5 text-[10.5px] font-medium text-emerald-500 ring-1 ring-emerald-500/20">
        <Check className="h-3 w-3" />
        Ready
      </span>
    );
  }
  if (status === 'building') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-orange)]/[0.12] px-2 py-0.5 text-[10.5px] font-medium text-[var(--brand-orange)] ring-1 ring-[var(--brand-orange)]/20">
        <Loader2 className="h-3 w-3 animate-spin" />
        Building
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/[0.12] px-2 py-0.5 text-[10.5px] font-medium text-red-400 ring-1 ring-red-500/20">
      Failed
    </span>
  );
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const { name, deploymentUrl, repo, commitMessage, relativeTime, branch, status, stack } =
    project;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group relative block rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/15 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)]"
    >
      {/* Hover accent line */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--brand-orange)]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
          <StackIcon stack={stack} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[14.5px] font-medium tracking-tight text-foreground">
                  {name}
                </h3>
                <StatusBadge status={status} />
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                {deploymentUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Project actions"
            >
              <MoreVertical className="h-4 w-4 rotate-90" />
            </button>
          </div>

          <Link
            href={'https://github.com/' + repo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11.5px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <SiGithub className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{truncateRepo(repo)}</span>
          </Link>

          <p className="mt-3 truncate text-[12.5px] text-foreground/80">{commitMessage}</p>

          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <span>{relativeTime}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="inline-flex items-center gap-1">
              <GitBranch className="h-3 w-3" aria-hidden />
              {branch}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
