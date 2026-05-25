'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState, type ComponentType } from 'react';
import {
  Folder,
  Rocket,
  Terminal,
  BarChart2,
  Settings,
  Plus,
} from 'lucide-react';

const STORAGE_KEY = 'dashboard-sidebar-width';
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 360;

type Item = {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  href: string;
};

const SIDEBAR_ITEMS: Item[] = [
  { label: 'Projects', Icon: Folder, href: '/dashboard/projects' },
  { label: 'Deployments', Icon: Rocket, href: '/dashboard/deployments' },
  { label: 'Logs', Icon: Terminal, href: '/dashboard/logs' },
  { label: 'Analytics', Icon: BarChart2, href: '/dashboard/analytics' },
  { label: 'Settings', Icon: Settings, href: '/dashboard/settings' },
];

const SideBar = () => {
  const pathname = usePathname();
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parsed)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(width));
  }, [width]);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startX;
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setWidth(next);
      };

      const end = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);
    },
    [width],
  );

  return (
    <div
      className="relative flex h-full shrink-0 flex-col border-r border-border bg-sidebar p-3"
      style={{ width }}
    >
      <Link
        href="/new/project"
        className="group mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-all hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New project
      </Link>

      <p className="px-3 pt-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Workspace
      </p>

      <nav className="flex flex-col gap-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all
                ${
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
            >
              <item.Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-orange)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-border bg-muted/40 p-4">
        <p className="mb-1 text-[12.5px] font-medium text-foreground">Free plan</p>
        <p className="mb-3 text-[11.5px] leading-relaxed text-muted-foreground">
          You&apos;re on the Hobby tier. Upgrade for unlimited projects.
        </p>
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-orange)] px-3 py-1 text-[11.5px] font-medium text-white transition-all hover:opacity-90"
        >
          Upgrade
        </Link>
      </div>

      <button
        type="button"
        aria-label="Resize sidebar"
        onPointerDown={onResizePointerDown}
        className="absolute top-0 -right-1 h-full w-2 cursor-col-resize touch-none border-0 bg-transparent p-0 hover:bg-foreground/5 active:bg-foreground/10"
      />
    </div>
  );
};

export default SideBar;
