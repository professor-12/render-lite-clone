'use client';

import { MdInsertLink } from 'react-icons/md';
import React, { useRef, useState } from 'react';
import GithubRepo from './GithubRepo';
import Template from './Template';

export default function Header() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');

  const githubRepoRegex = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/;
  const urlIsValid = githubRepoRegex.test(url.trim());

  return (
    <main className="bg-[#0a0a0a] min-h-screen py-12 pt-20">
      <div className="max-w-5xl w-full mx-auto px-6">

        {/* Page title */}
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Let&apos;s build something new.
        </h1>
        <p className="mt-2 text-[14px] text-[#888]">
          Paste a GitHub URL or pick a template to deploy in seconds.
        </p>

        {/* URL input */}
        <div
          onClick={() => inputRef.current?.focus?.()}
          className="flex border border-white/[0.08] bg-[#111111] px-3.5 items-center gap-2.5 focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 ring-offset-[3px] ring-offset-[#0a0a0a] rounded-xl mt-6 transition-all cursor-text"
        >
          <MdInsertLink className="text-[22px] text-[#555] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="py-3.5 focus:outline-none flex-1 text-[14px] bg-transparent placeholder:text-[#444] text-[#f0f0f0]"
          />
          {url.trim().length > 0 && (
            <button
              disabled={!urlIsValid}
              className={`flex-shrink-0 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all
                ${urlIsValid
                  ? 'bg-white text-black hover:bg-[#e8e8e8]'
                  : 'bg-white/[0.06] text-[#555] cursor-not-allowed'
                }`}
            >
              Deploy
            </button>
          )}
        </div>

        {/* Validation hint */}
        {url.trim().length > 0 && !urlIsValid && (
          <p className="mt-2 text-[12px] text-red-400 flex items-center gap-1">
            <span>⚠</span> Enter a valid GitHub repo URL — e.g.{' '}
            <code className="font-mono">https://github.com/user/repo</code>
          </p>
        )}

        {/* Divider + two-panel section */}
        <div className="mt-14 border border-white/[0.08] rounded-xl overflow-hidden bg-[#111111] divide-x divide-white/[0.06] flex min-h-[420px]">
          <div className="flex-1 min-w-0">
            <GithubRepo />
          </div>
          <div className="flex-1 min-w-0">
            <Template />
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[12px] text-[#444] font-mono">
          Deployments run on Render Lite&apos;s global edge — SSL and CDN included automatically.
        </p>
      </div>
    </main>
  );
}