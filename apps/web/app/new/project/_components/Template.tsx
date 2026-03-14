'use client';

import { useState } from 'react';
import { FiZap } from 'react-icons/fi';

const TEMPLATES = [
  {
    name: 'Next.js',
    desc: 'App Router, Tailwind, TypeScript',
    icon: '▲',
    iconBg: 'bg-black',
    iconColor: 'text-white',
    tag: 'Popular',
  },
  {
    name: 'SvelteKit',
    desc: 'Full-stack Svelte framework',
    icon: 'S',
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    tag: null,
  },
  {
    name: 'Remix',
    desc: 'Full-stack React with loaders',
    icon: 'R',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
    tag: null,
  },
  {
    name: 'Astro',
    desc: 'Content-first static sites',
    icon: '✦',
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    tag: null,
  },
  {
    name: 'FastAPI',
    desc: 'Python REST API starter',
    icon: '⚡',
    iconBg: 'bg-teal-500',
    iconColor: 'text-white',
    tag: null,
  },
  {
    name: 'Express + TS',
    desc: 'Node API with TypeScript',
    icon: 'E',
    iconBg: 'bg-gray-700',
    iconColor: 'text-white',
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
      <div className="flex items-center gap-2 mb-4">
        <FiZap className="text-[17px] text-[#888]" />
        <h2 className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">
          Start from a Template
        </h2>
      </div>

      {/* Template grid */}
      <ul className="grid grid-cols-1 gap-1">
        {TEMPLATES.map((tpl) => (
          <li
            key={tpl.name}
            className="flex items-center justify-between group px-3 py-2.5 rounded-lg border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] transition-all cursor-default"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${tpl.iconBg} ${tpl.iconColor}`}
              >
                {tpl.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#f0f0f0]">
                    {tpl.name}
                  </span>
                  {tpl.tag && (
                    <span className="text-[10px] font-mono font-medium bg-[rgba(232,255,87,0.08)] text-[#e8ff57] border border-[rgba(232,255,87,0.2)] px-1.5 py-0.5 rounded-full">
                      {tpl.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#555] truncate">{tpl.desc}</p>
              </div>
            </div>

            <button
              onClick={() => handleDeploy(tpl.name)}
              disabled={deploying === tpl.name}
              className={`ml-3 flex-shrink-0 text-[12px] font-medium px-3.5 py-1.5 rounded-md border transition-all
                ${deploying === tpl.name
                  ? 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.2)] text-[#4ade80] cursor-default'
                  : 'bg-transparent border-white/[0.1] text-[#888] opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black hover:border-white'
                }`}
            >
              {deploying === tpl.name ? '✓ Cloning…' : 'Deploy'}
            </button>
          </li>
        ))}
      </ul>

      {/* Browse all */}
      <button className="mt-3 w-full text-[12px] text-[#555] hover:text-[#888] py-2 border border-dashed border-white/[0.07] rounded-lg hover:border-white/[0.14] transition-colors">
        Browse all templates →
      </button>
    </div>
  );
}