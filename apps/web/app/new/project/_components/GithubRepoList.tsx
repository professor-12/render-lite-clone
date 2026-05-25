'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, Search, Check, Plus } from 'lucide-react';

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Go: '#00add8',
  Rust: '#dea584',
};

const LANGICON = {};

export type RepoItem = {
  name: string;
  language: string | null;
  updatedAt: string;
  private: boolean;
  url: string;
  branch: string;
  rootDir: string;
};

type GithubRepoListProps = {
  repos: RepoItem[];

};

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3600_000);
    const diffDays = Math.floor(diffMs / 86400_000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export default function GithubRepoList({ repos }: GithubRepoListProps) {
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState<string | null>(null);
  const [isInstallingApp, setIsInstallingApp] = useState(false);
  const router = useRouter();
  const debouncesearch = useDebounce(search, 1000);
  const searchParams = useSearchParams();

  const filtered = repos;

  useEffect(() => {
    if (!debouncesearch) return;
    const newSearchParams = new URLSearchParams();
    newSearchParams.append('q', debouncesearch);
    router.push(`/new/project?q=${debouncesearch}`);
  }, [debouncesearch]);

  const handleImport = (repo: GithubRepoListProps['repos'][0]) => {
    router.push(`/new/import?repo=${encodeURIComponent(repo.name)}&url=${encodeURIComponent(repo.url)}&branch=${encodeURIComponent(repo.branch)}&rootDir=${encodeURIComponent(repo.rootDir)}`);
  };

  const handleInstallApp = () => {
    setIsInstallingApp(true);
    const features =
      'width=500,height=600,resizable=yes,scrollbars=yes,status=yes,toolbar=yes,menubar=yes';
    const popup = window.open(
      'https://github.com/apps/renderlite/installations/select_target',
      'emmanuel-github-app-install',
      features,
    );
    if (popup) {
      popup.addEventListener('close', () => {
        setIsInstallingApp(false);
      });
      popup.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'github_install_success') {
          setIsInstallingApp(false);
        }
        if (event.data.type === 'github_install_error') {
          setIsInstallingApp(false);
          alert('Error installing GitHub app: ' + event.data.error);
        }
        if (event.data.type === 'github_install_cancel') {
          setIsInstallingApp(false);
          alert('Installation cancelled');
        }
      });
    }
    window.addEventListener('close', () => {
      setIsInstallingApp(false);
    });
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'github_install_success') {
        setIsInstallingApp(false);
      }
      if (event.data.type === 'github_install_error') {
        setIsInstallingApp(false);
        alert('Error installing GitHub app: ' + event.data.error);
      }
      if (event.data.type === 'github_install_cancel') {
        setIsInstallingApp(false);
        alert('Installation cancelled');
      }
    });
  };
  return (
    <>
      {/* Search */}
      <div className="mb-3 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 transition-all focus-within:border-brand-orange/40 focus-within:ring-4 focus-within:ring-brand-orange/10">
        <Search className="h-4 w-4 shrink-0 text-brand-muted" />
        <input
          type="text"
          placeholder="Search repositories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-brand-cream placeholder:text-brand-muted focus:outline-none"
          aria-label="Search repositories"
        />
      </div>

      {/* Repo list */}
      <ul className="divide-y divide-white/[0.05]">
        {filtered.length === 0 && (
          <li className="py-8 text-center text-[12.5px] leading-relaxed text-brand-muted">
            {repos.length === 0
              ? 'No repositories found. Connect a GitHub account to import.'
              : 'No repositories match your search.'}
          </li>
        )}
        {filtered.map((repo) => (
          <li key={repo.name} className="group flex items-center justify-between py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: LANG_COLORS[repo.language ?? ''] ?? '#555' }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-medium text-brand-cream">
                    {repo.name}
                  </span>
                  {repo.private && (
                    <Lock className="h-3 w-3 shrink-0 text-brand-muted" />
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10.5px] text-brand-muted">
                  <span>{repo.language ?? '—'}</span>
                  <span className="opacity-50">·</span>
                  <span>{formatRelativeTime(repo.updatedAt)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleImport(repo)}
              disabled={importing === repo.name}
              className={`ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all
                ${
                  importing === repo.name
                    ? 'cursor-default bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25'
                    : 'border border-white/[0.1] bg-transparent text-brand-muted-soft hover:border-brand-cream hover:bg-brand-cream hover:text-black'
                }`}
            >
              {importing === repo.name ? (
                <>
                  <Check className="h-3 w-3" />
                  Importing…
                </>
              ) : (
                'Import'
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Connect more */}
      <button
        type="button"
        disabled={isInstallingApp}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.14] bg-white/[0.02] py-2.5 text-[12.5px] font-medium text-brand-muted-soft transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-brand-cream"
        onClick={handleInstallApp}
      >
        {isInstallingApp ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Installing…
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            Connect your GitHub account
          </>
        )}
      </button>
    </>
  );
}
