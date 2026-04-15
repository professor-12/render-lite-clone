'use client';

import Link from 'next/link';
import { RiGitBranchLine, RiMore2Fill } from '@remixicon/react';
import type { ProjectListItem, ProjectStack, ProjectStatus } from '@/lib/projects/types';
import { SiGithub, SiNextdotjs, SiNodedotjs, SiVercel, SiVuedotjs } from 'react-icons/si';

export type { ProjectListItem, ProjectStack, ProjectStatus } from '@/lib/projects/types';

function StackIcon({ stack }: { stack: ProjectStack }) {
  const common = 'size-9';
  switch (stack) {
    case 'next':
      return <SiNextdotjs className={`${common} text-white`} aria-hidden />;
    case 'vue':
      return <SiVuedotjs className={`${common} text-[#42b883]`} aria-hidden />;
    case 'vercel':
      return <SiVercel className={`${common} text-white`} aria-hidden />;
    case 'node':
      return <SiNodedotjs className={`${common} text-[#3c873a]`} aria-hidden />;
    default:
      return <SiVercel className={`${common} text-white`} aria-hidden />;
  }
}

function truncateRepo(path: string, max = 28) {
  if (path.length <= max) return path;
  return `${path.slice(0, max - 1)}…`;
}

function DeploymentStatus({ status }: { status: ProjectStatus }) {
  if (status === 'ready') {
    return (
      <div
        className="relative flex size-9 shrink-0 items-center justify-center"
        title="Deployment ready"
      >
        <svg className="absolute size-9 -rotate-90 text-blue-500/45" viewBox="0 0 36 36" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="38 60"
          />
        </svg>
        <span className="relative flex size-7 items-center justify-center rounded-full bg-[#0f0f0f] ring-1 ring-white/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 6L9 17l-5-5"
              stroke="#a3a3a3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    );
  }

  if (status === 'building') {
    return (
      <div
        className="relative flex size-9 shrink-0 items-center justify-center"
        title="Building"
      >
        <span className="absolute size-9 animate-spin rounded-full border-2 border-transparent border-t-blue-500/80 border-l-blue-500/40" />
        <span className="relative size-2 rounded-full bg-blue-400" />
      </div>
    );
  }

  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/25"
      title="Failed"
    >
      <span className="text-[13px] font-semibold text-red-400">!</span>
    </div>
  );
}

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const { name, deploymentUrl, repo, commitMessage, relativeTime, branch, status, stack } =
    project;

  return (
    <article className="group relative rounded-lg border border-[#262626] bg-[#0a0a0a] p-5 transition-colors hover:border-[#333333]">
      <div className="flex gap-4">
        <div className="flex shrink-0 items-start pt-0.5">
          <div className="flex size-11 items-center justify-center rounded-md bg-black/40 ring-1 ring-white/6">
            <StackIcon stack={stack} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block truncate font-semibold text-white transition-colors hover:text-white/90"
              >
                {name}
              </Link>
              <p className="mt-0.5 truncate text-[13px] text-[#737373]">{deploymentUrl}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <DeploymentStatus status={status} />
              <button
                type="button"
                className="rounded p-1 text-[#737373] transition-colors hover:bg-white/6 hover:text-white"
                aria-label="Project actions"
              >
                <RiMore2Fill className="size-5 rotate-90" />
              </button>
            </div>
          </div>

          <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/8 bg-[#141414] px-2 py-1 text-[12px] text-[#a3a3a3]">
            <SiGithub className="size-3.5 shrink-0 text-white/70" aria-hidden />
            <span className="truncate font-mono">{truncateRepo(repo)}</span>
          </div>

          <p className="mt-2 truncate text-[13px] text-[#737373]">{commitMessage}</p>

          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-[#525252]">
            <span>{relativeTime}</span>
            <span className="text-[#404040]">on</span>
            <span className="inline-flex items-center gap-1 text-[#737373]">
              <RiGitBranchLine className="size-3.5" aria-hidden />
              {branch}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
