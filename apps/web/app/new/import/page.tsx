'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiChevronLeft, FiGitBranch, FiTerminal, FiFolder, FiGlobe } from 'react-icons/fi';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[13px] font-medium text-[#ccc] mb-1.5">
      {children}
    </label>
  );
}

function HintText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[11px] text-[#555]">{children}</p>;
}

export default function ImportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const repoName = searchParams.get('repo') ?? '';
  const repoUrl = searchParams.get('url') ?? '';

  const [name, setName] = useState(repoName);
  const [gitUrl, setGitUrl] = useState(repoUrl);
  const [branch, setBranch] = useState('main');
  const [rootDir, setRootDir] = useState('./');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [startCommand, setStartCommand] = useState('npm start');
  const [deploying, setDeploying] = useState(false);

  const canDeploy = name.trim().length > 0 && gitUrl.trim().length > 0;

  const handleDeploy = () => {
    if (!canDeploy) return;
    setDeploying(true);

  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="fixed top-0 left-0 right-0 z-50 flex w-full justify-between items-center px-6 h-14 border-b border-white/8 bg-[#0a0a0a]/80 backdrop-blur-md">
        <Link
          href="/new/project"
          className="flex items-center gap-1 text-[13px] text-[#888] hover:text-white transition-colors"
        >
          <FiChevronLeft className="text-[15px]" />
          Back
        </Link>
        <h1 className="text-[13px] font-medium text-[#888] tracking-tight">Configure Project</h1>
        <button className="size-7 rounded-full border border-white/[0.14] bg-[#181818] hover:border-white/30 transition-colors flex items-center justify-center overflow-hidden">
          <span className="text-[11px] font-semibold text-[#888]">XS</span>
        </button>
      </header>

      <main className="bg-[#0a0a0a] min-h-screen py-12 pt-20">
        <div className="max-w-2xl w-full mx-auto px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Configure &amp; Deploy
          </h1>
          <p className="mt-2 text-[14px] text-[#888]">
            Set up your build settings, then deploy to the edge.
          </p>

          {/* Repository info */}
          {gitUrl && (
            <div className="mt-8 flex items-center gap-3 px-4 py-3 rounded-lg border border-white/8 bg-[#111111]">
              <FiGitBranch className="text-[17px] text-[#555] shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#f0f0f0] truncate">{gitUrl}</p>
                <p className="text-[11px] text-[#555] mt-0.5">Branch: {branch}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="mt-8 space-y-6">
            {/* Project name */}
            <div>
              <SectionLabel>Project Name</SectionLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-app"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] text-[13px] text-[#f0f0f0] placeholder:text-[#444] focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
              />
              <HintText>Used as the subdomain: {name || 'your-project'}.bigdev.uk</HintText>
            </div>

            {/* Git URL */}
            <div>
              <SectionLabel>Repository URL</SectionLabel>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
                <FiGlobe className="text-[15px] text-[#555] shrink-0" />
                <input
                  type="url"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
                />
              </div>
            </div>

            {/* Branch + Root dir row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SectionLabel>Branch</SectionLabel>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
                  <FiGitBranch className="text-[15px] text-[#555] shrink-0" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <SectionLabel>Root Directory</SectionLabel>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
                  <FiFolder className="text-[15px] text-[#555] shrink-0" />
                  <input
                    type="text"
                    value={rootDir}
                    onChange={(e) => setRootDir(e.target.value)}
                    placeholder="./"
                    className="flex-1 text-[13px] bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Build & Start commands */}
            <div className="rounded-xl border border-white/8 bg-[#111111] divide-y divide-white/6 overflow-hidden">
              <div className="px-4 py-4">
                <SectionLabel>Build Command</SectionLabel>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
                  <FiTerminal className="text-[15px] text-[#555] shrink-0" />
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    placeholder="npm run build"
                    className="flex-1 text-[13px] font-mono bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
                  />
                </div>
                <HintText>The command that builds your application for production.</HintText>
              </div>
              <div className="px-4 py-4">
                <SectionLabel>Start Command</SectionLabel>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a] focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 transition-all">
                  <FiTerminal className="text-[15px] text-[#555] shrink-0" />
                  <input
                    type="text"
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    placeholder="npm start"
                    className="flex-1 text-[13px] font-mono bg-transparent text-[#f0f0f0] placeholder:text-[#444] focus:outline-none"
                  />
                </div>
                <HintText>The command that starts your application.</HintText>
              </div>
            </div>
          </div>

          {/* Deploy button */}
          <button
            type="button"
            onClick={handleDeploy}
            disabled={!canDeploy || deploying}
            className={`mt-10 w-full py-3 rounded-lg text-[14px] font-semibold transition-all
              ${canDeploy && !deploying
                ? 'bg-white text-black hover:bg-[#e8e8e8]'
                : 'bg-white/[0.06] text-[#555] cursor-not-allowed'
              }`}
          >
            {deploying ? 'Deploying…' : 'Deploy Project'}
          </button>

          <p className="mt-5 text-center text-[12px] text-[#444] font-mono">
            SSL and CDN included automatically on every deploy.
          </p>
        </div>
      </main>
    </div>
  );
}
