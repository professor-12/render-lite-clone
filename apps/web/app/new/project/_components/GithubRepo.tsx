import { cookies } from 'next/headers';
import { Github } from 'lucide-react';
import GithubRepoList from './GithubRepoList';
import ConnectGitHubPopupButton from './ConnectGitHubPopupButton';
import type { RepoItem } from './GithubRepoList';
import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type GitHubRepoApi = {
  name: string;
  language: string | null;
  updated_at: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  root_dir: string;
};

type BackendResponse = {
  repositories?: { repositories?: GitHubRepoApi[] } | GitHubRepoApi[];
};

function normalizeRepos(payload: BackendResponse): RepoItem[] {
  const raw = payload.repositories;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : (raw.repositories ?? []);
  console.log({ list });
  return list
    .map((r: GitHubRepoApi) => ({
      name: r.name,
      language: r.language ?? null,
      updatedAt: r.updated_at,
      private: r.private ?? false,
      url: r.html_url,
      branch: r.default_branch,
      rootDir: r.root_dir,
    }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

async function fetchUserRepos(q: string): Promise<RepoItem[]> {
  console.log({ q });
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured');
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('renderLite-access')?.value;
  if (!token) {
    return [];
  }
  const res = await fetch(`${BACKEND_URL}/api/v1/github/repositories?q=${encodeURIComponent(q)}`, {
    headers: {
      Cookie: `renderLite-access=${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    if (res.status === 401) {
      return [];
    }
    const body = await res.text();

    let message = `Failed to load repositories (${res.status})`;
    try {
      const json = JSON.parse(body) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }

  const data = (await res.json()) as BackendResponse;
  return normalizeRepos(data);
}

export default async function GithubRepo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  let repos: RepoItem[];
  const { q = '' } = (await searchParams) || {};
  try {
    repos = await fetchUserRepos(q);
  } catch (error) {
    return (
      <div className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Github className="h-4 w-4 text-brand-cream" />
          <h2 className="text-[13px] font-medium tracking-tight text-brand-cream">
            Import Git repository
          </h2>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[13px]">
          <p className="font-medium text-red-300">Could not load repositories</p>
          <p className="mt-1 text-[12.5px] text-red-400/90">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
        </div>
        <ConnectGitHubPopupButton className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/[0.14] bg-white/[0.02] py-2.5 text-[12.5px] font-medium text-brand-muted-soft transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-brand-cream disabled:opacity-70">
          + Connect your GitHub account
        </ConnectGitHubPopupButton>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-brand-cream" />
          <h2 className="text-[13px] font-medium tracking-tight text-brand-cream">
            Import Git repository
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-brand-muted">
          {repos.length} repos
        </span>
      </div>
      <GithubRepoList repos={repos} />
    </div>
  );
}
