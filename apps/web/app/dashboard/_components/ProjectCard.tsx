'use client';

import Link from 'next/link';
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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-green-500"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>
    );
  }
  if (status === 'building') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-yellow-500 animate-spin"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
  );
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const { name, deploymentUrl, repo, commitMessage, relativeTime, branch, status, stack } =
    project;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group relative block rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-foreground/15 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)]"
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
                {/* <StatusBadge status={status} /> */}
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                {deploymentUrl}
              </p>
            </div>
            <StatusBadge status={status} />
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
              {/* <GitBranch className="h-3 w-3" aria-hidden /> */}
              {branch}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
