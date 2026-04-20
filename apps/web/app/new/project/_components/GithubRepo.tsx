import { cookies } from 'next/headers';
import { FiGithub } from 'react-icons/fi';
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
        <div className="flex items-center gap-2 mb-4">
          <FiGithub className="text-[17px] text-[#888]" />
          <h2 className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">
            Import Git Repository
          </h2>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
          <p className="mt-1 text-red-400/90">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
          <p className="font-medium text-xs">Could not load repositories</p>
        </div>
        <ConnectGitHubPopupButton className="mt-3 cursor-pointer w-full text-[13px] font-medium text-[#a0a0a0] hover:text-white py-2.5 border border-dashed border-white/20 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 transition-colors disabled:opacity-70">
          + Connect your GitHub account
        </ConnectGitHubPopupButton>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiGithub className="text-[17px] text-[#888]" />
        <h2 className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">
          Import Git Repository
        </h2>
      </div>
      <GithubRepoList repos={repos} />
    </div>
  );
}
