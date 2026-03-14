'use client';

import { useGetUserRepos } from '@/app/queries/github.query';
import { useState } from 'react';
import { FiGithub, FiLock, FiSearch } from 'react-icons/fi';

const MOCK_REPOS = [
  { name: 'my-nextjs-app',     lang: 'TypeScript', updated: '2h ago',   private: false },
  { name: 'api-server',        lang: 'Python',     updated: '1d ago',   private: false },
  { name: 'dashboard-ui',      lang: 'TypeScript', updated: '3d ago',   private: true  },
  { name: 'mobile-app',        lang: 'JavaScript', updated: '1w ago',   private: false },
  { name: 'ml-pipeline',       lang: 'Python',     updated: '2w ago',   private: true  },
  { name: 'landing-page',      lang: 'TypeScript', updated: '3w ago',   private: false },
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python:     '#3572A5',
  Go:         '#00add8',
  Rust:       '#dea584',
};

export default function GithubRepo() {
  const [search, setSearch] = useState('')
  const {data} = useGetUserRepos()
  console.log(data)

  const [importing, setImporting] = useState<string | null>(null);

  const filtered = MOCK_REPOS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = (name: string) => {
    setImporting(name);
    setTimeout(() => setImporting(null), 1500);
  };

  return (
    <div className="p-6">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <FiGithub className="text-[17px] text-[#888]" />
        <h2 className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">
          Import Git Repository
        </h2>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border border-white/[0.08] bg-[#0a0a0a] rounded-lg px-3 py-2 mb-3 focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
        <FiSearch className="text-[#555] text-[15px] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search repositories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-[13px] bg-transparent focus:outline-none placeholder:text-[#444] text-[#f0f0f0]"
        />
      </div>

      {/* Repo list */}
      <ul className="divide-y divide-white/[0.05]">
        {filtered.length === 0 && (
          <li className="py-8 text-center text-[13px] text-[#555]">
            No repositories found.
          </li>
        )}
        {filtered.map((repo) => (
          <li key={repo.name} className="flex items-center justify-between py-3 group">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: LANG_COLORS[repo.lang] ?? '#555' }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-[#f0f0f0] truncate">
                    {repo.name}
                  </span>
                  {repo.private && (
                    <FiLock className="text-[11px] text-[#555] flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-[#555]">{repo.lang}</span>
                  <span className="text-[#444] text-[10px]">·</span>
                  <span className="text-[11px] text-[#555]">{repo.updated}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleImport(repo.name)}
              disabled={importing === repo.name}
              className={`ml-3 flex-shrink-0 text-[12px] font-medium px-3.5 py-1.5 rounded-md border transition-all
                ${importing === repo.name
                  ? 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.2)] text-[#4ade80] cursor-default'
                  : 'bg-transparent border-white/[0.1] text-[#888] hover:bg-white hover:text-black hover:border-white'
                }`}
            >
              {importing === repo.name ? '✓ Importing…' : 'Import'}
            </button>
          </li>
        ))}
      </ul>

      {/* Connect more */}
      <button className="mt-3 w-full text-[12px] text-[#555] hover:text-[#888] py-2 border border-dashed border-white/[0.07] rounded-lg hover:border-white/[0.14] transition-colors">
        + Connect another GitHub account
      </button>
    </div>
  );
}