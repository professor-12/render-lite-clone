'use client';

import { useState } from 'react';
import { Zap, Check, ArrowRight } from 'lucide-react';

const TEMPLATES = [
  {
    name: 'Next.js',
    desc: 'App Router · Tailwind · TypeScript',
    icon: '▲',
    iconBg: 'bg-black text-brand-cream ring-1 ring-white/15',
    tag: 'Popular',
  },
  {
    name: 'SvelteKit',
    desc: 'Full-stack Svelte framework',
    icon: 'S',
    iconBg: 'bg-orange-500 text-white',
    tag: null,
  },
  {
    name: 'Remix',
    desc: 'Full-stack React with loaders',
    icon: 'R',
    iconBg: 'bg-blue-600 text-white',
    tag: null,
  },
  {
    name: 'Astro',
    desc: 'Content-first static sites',
    icon: '✦',
    iconBg: 'bg-purple-600 text-white',
    tag: null,
  },
  {
    name: 'FastAPI',
    desc: 'Python REST API starter',
    icon: '⚡',
    iconBg: 'bg-teal-500 text-white',
    tag: null,
  },
  {
    name: 'Express + TS',
    desc: 'Node API with TypeScript',
    icon: 'E',
    iconBg: 'bg-zinc-700 text-white',
    tag: null,
  },
];

export default function Template() {
  const [deploying, setDeploying] = useState<string | null>(null);

  const handleDeploy = (name: string) => {
    setDeploying(name);
    setTimeout(() => setDeploying(null), 1500);
  };

  return (
    <div className="p-6">
      {/* Section heading */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand-orange" />
          <h2 className="text-[13px] font-medium tracking-tight text-brand-cream">
            Start from a template
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-brand-muted">
          {TEMPLATES.length} templates
        </span>
      </div>

      {/* Template grid */}
      <ul className="grid grid-cols-1 gap-1">
        {TEMPLATES.map((tpl) => (
          <li
            key={tpl.name}
            className="group flex cursor-default items-center justify-between rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-white/[0.06] hover:bg-white/[0.03]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[14px] font-bold ${tpl.iconBg}`}
              >
                {tpl.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-brand-cream">
                    {tpl.name}
                  </span>
                  {tpl.tag && (
                    <span className="rounded-full border border-brand-orange/25 bg-brand-orange/10 px-1.5 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-wider text-brand-orange">
                      {tpl.tag}
                    </span>
                  )}
                </div>
                <p className="truncate text-[11.5px] text-brand-muted-soft">{tpl.desc}</p>
              </div>
            </div>

            <button
              onClick={() => handleDeploy(tpl.name)}
              disabled={deploying === tpl.name}
              className={`ml-3 inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all
                ${
                  deploying === tpl.name
                    ? 'cursor-default bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25'
                    : 'border border-white/[0.1] bg-transparent text-brand-muted-soft opacity-0 group-hover:opacity-100 hover:bg-brand-cream hover:text-black hover:border-brand-cream'
                }`}
            >
              {deploying === tpl.name ? (
                <>
                  <Check className="h-3 w-3" />
                  Cloning…
                </>
              ) : (
                <>
                  Deploy
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Browse all */}
      <button className="mt-3 w-full rounded-xl border border-dashed border-white/[0.08] py-2.5 text-[12px] text-brand-muted transition-colors hover:border-white/[0.18] hover:text-brand-muted-soft">
        Browse all templates →
      </button>
    </div>
  );
}
