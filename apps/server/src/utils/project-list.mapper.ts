import type { Deployment, Project } from '../generated/prisma/client';

export type UiProjectStatus = 'ready' | 'building' | 'error';

export type UiProjectStack = 'next' | 'vue' | 'vercel' | 'node';

export type ProjectListItemDto = {
  id: string;
  name: string;
  deploymentUrl: string;
  repo: string;
  commitMessage: string;
  relativeTime: string;
  branch: string;
  status: UiProjectStatus;
  stack: UiProjectStack;
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ago`;
  if (hr > 0) return `${hr}h ago`;
  if (min > 0) return `${min}m ago`;
  return 'just now';
}

function repoPathFromUrl(repoUrl: string): string {
  const trimmed = repoUrl.trim();
  try {
    const withProto = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    /* fall through */
  }
  return trimmed.replace(/^https?:\/\//i, '').replace(/^github\.com\//i, '') || trimmed;
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function deploymentStatusToUi(status: string | undefined): UiProjectStatus {
  if (!status) return 'building';
  if (status === 'build_failed' || status === 'deploy_failed') return 'error';
  if (status === 'live') return 'ready';
  return 'building';
}

function guessStack(repoUrl: string): UiProjectStack {
  const lower = repoUrl.toLowerCase();
  if (lower.includes('vue')) return 'vue';
  if (lower.includes('next') || lower.includes('nuxt')) return 'next';
  if (lower.includes('vercel')) return 'vercel';
  return 'node';
}

export function mapProjectToListItem(
  project: Project & { deployments: Deployment[] },
): ProjectListItemDto {
  const latest = project.deployments[0];
  const refDate = latest?.updatedAt ?? project.updatedAt;
  const deploymentUrl = project.domain
    ? project.domain.includes('://')
      ? project.domain
      : `https://${project.domain}`
    : `${slugifyName(project.name) || 'project'}.render.local`;

  return {
    id: project.id,
    name: project.name,
    deploymentUrl,
    repo: repoPathFromUrl(project.repoUrl),
    commitMessage: latest?.description?.trim() || '—',
    relativeTime: formatRelativeTime(refDate),
    branch: project.branch,
    status: deploymentStatusToUi(latest?.status),
    stack: guessStack(project.repoUrl),
  };
}
