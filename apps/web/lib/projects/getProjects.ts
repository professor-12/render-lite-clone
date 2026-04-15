import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ProjectListItem } from './types';

type ProjectsResponse = {
  message?: string;
  data?: ProjectListItem[];
};

export async function getProjects(): Promise<ProjectListItem[]> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) {
    console.warn('[getProjects] NEXT_PUBLIC_BACKEND_URL is not set');
    return [];
  }

  const h = await headers();
  const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/project`, {
    headers: {
      cookie: h.get('cookie') ?? '',
    },
    cache: 'no-store',
  });

  if (res.status === 401) {
    redirect('/auth/login');
  }

  if (!res.ok) {
    throw new Error(`Failed to load projects (${res.status})`);
  }

  const json = (await res.json()) as ProjectsResponse;
  return Array.isArray(json.data) ? json.data : [];
}
