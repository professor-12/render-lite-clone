'use client';

import { Link2, AlertCircle } from 'lucide-react';
import { useRef, useState } from 'react';

const GITHUB_REPO_URL_REGEX = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/;

export default function DeployUrlInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');

  const urlIsValid = GITHUB_REPO_URL_REGEX.test(url.trim());

  return (
    <div className="mt-8">
      <div
        role="presentation"
        onClick={() => inputRef.current?.focus?.()}
        className="group flex cursor-text items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-5 transition-all focus-within:border-brand-orange/40 focus-within:bg-white/[0.04] focus-within:ring-4 focus-within:ring-brand-orange/10"
      >
        <Link2 className="h-5 w-5 shrink-0 text-brand-muted-soft" aria-hidden />
        <input
          ref={inputRef}
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a GitHub repository URL"
          className="flex-1 bg-transparent py-4 text-[14px] text-brand-cream placeholder:text-brand-muted focus:outline-none"
          aria-label="GitHub repository URL"
          aria-invalid={url.trim().length > 0 && !urlIsValid}
        />
        {url.trim().length > 0 && (
          <button
            type="button"
            disabled={!urlIsValid}
            className={`shrink-0 rounded-full px-5 py-2 text-[13px] font-medium transition-all
              ${
                urlIsValid
                  ? 'bg-brand-orange text-white hover:opacity-90'
                  : 'cursor-not-allowed bg-white/[0.06] text-brand-muted'
              }`}
          >
            Deploy
          </button>
        )}
      </div>

      {url.trim().length > 0 && !urlIsValid && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-red-400" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          Enter a valid GitHub repo URL — e.g.{' '}
          <code className="font-mono text-red-300">github.com/user/repo</code>
        </p>
      )}
    </div>
  );
}
