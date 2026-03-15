'use client';

import { MdInsertLink } from 'react-icons/md';
import { useRef, useState } from 'react';

const GITHUB_REPO_URL_REGEX = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/;

export default function DeployUrlInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');

  const urlIsValid = GITHUB_REPO_URL_REGEX.test(url.trim());

  return (
    <div className="mt-6">
      <div
        role="presentation"
        onClick={() => inputRef.current?.focus?.()}
        className="flex border border-white/[0.08] bg-[#111111] px-3.5 items-center gap-2.5 focus-within:ring-2 focus-within:ring-white/10 focus-within:border-white/20 ring-offset-[3px] ring-offset-[#0a0a0a] rounded-xl transition-all cursor-text"
      >
        <MdInsertLink className="text-[22px] text-[#555] shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="py-3.5 focus:outline-none flex-1 text-[14px] bg-transparent placeholder:text-[#444] text-[#f0f0f0]"
          aria-label="GitHub repository URL"
          aria-invalid={url.trim().length > 0 && !urlIsValid}
        />
        {url.trim().length > 0 && (
          <button
            type="button"
            disabled={!urlIsValid}
            className={`shrink-0 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all
              ${
                urlIsValid
                  ? 'bg-white text-black hover:bg-[#e8e8e8]'
                  : 'bg-white/[0.06] text-[#555] cursor-not-allowed'
              }`}
          >
            Deploy
          </button>
        )}
      </div>

      {url.trim().length > 0 && !urlIsValid && (
        <p className="mt-2 text-[12px] text-red-400 flex items-center gap-1" role="alert">
          <span aria-hidden>⚠</span> Enter a valid GitHub repo URL — e.g.{' '}
          <code className="font-mono">https://github.com/user/repo</code>
        </p>
      )}
    </div>
  );
}
