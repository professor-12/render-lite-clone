'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLock, FiSearch } from 'react-icons/fi';

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
    const metaDataparams = {
      name: repo.name,
    };
    alert(JSON.stringify({ repo }));
  };

  const handleInstallApp = () => {
    setIsInstallingApp(true);
    const features =
      'width=500,height=600,resizable=yes,scrollbars=yes,status=yes,toolbar=yes,menubar=yes';
    window.open(
      'https://github.com/apps/renderlite/installations/select_target',
      'emmanuel-github-app-install',
      features,
    );
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
      <div className="flex items-center gap-2 border border-white/8 bg-[#0a0a0a] rounded-lg px-3 py-2 mb-3 focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
        <FiSearch className="text-[#555] text-[15px] shrink-0" />
        <input
          type="text"
          placeholder="Search repositories…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="flex-1 text-[13px] bg-transparent focus:outline-none placeholder:text-[#444] text-[#f0f0f0]"
          aria-label="Search repositories"
        />
      </div>

      {/* Repo list */}
      <ul className="divide-y divide-white/5">
        {filtered.length === 0 && (
          <li className="py-8 text-center text-[13px] text-[#555]">
            {repos.length === 0
              ? 'No repositories found. Connect a GitHub account to import or Install the RenderLite GitHub app to import your repositories.'
              : 'No repositories match your search. Connect a GitHub account to import or Install the RenderLite GitHub app to import your repositories.'}
          </li>
        )}
        {filtered.map((repo) => (
          <li key={repo.name} className="flex items-center justify-between py-3 group">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: LANG_COLORS[repo.language ?? ''] ?? '#555',
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-[#f0f0f0] truncate">
                    {repo.name}
                  </span>
                  {repo.private && <FiLock className="text-[11px] text-[#555] shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-[#555]">{repo.language ?? '—'}</span>
                  <span className="text-[#444] text-[10px]">·</span>
                  <span className="text-[11px] text-[#555]">
                    {formatRelativeTime(repo.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleImport(repo)}
              disabled={importing === repo.name}
              className={`ml-3 shrink-0 text-[12px] font-medium px-3.5 py-1.5 rounded-md border transition-all
                ${
                  importing === repo.name
                    ? 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.2)] text-[#4ade80] cursor-default'
                    : 'bg-transparent border-white/10 text-[#888] hover:bg-white hover:text-black hover:border-white'
                }`}
            >
              {importing === repo.name ? '✓ Importing…' : 'Import'}
            </button>
          </li>
        ))}
      </ul>

      {/* Connect more */}
      <button
        type="button"
        disabled={isInstallingApp}
        className="mt-3 w-full text-[13px] font-medium text-[#a0a0a0] hover:text-white py-2.5 border border-dashed border-white/20 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 transition-colors"
        onClick={handleInstallApp}
      >
        {isInstallingApp ? '✓ Installing…' : '+ Connect your GitHub account'}
      </button>
    </>
  );
}
