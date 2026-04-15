'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { GrProjects } from 'react-icons/gr';
import { AiOutlineDeploymentUnit } from 'react-icons/ai';
import { LuLogs } from 'react-icons/lu';

import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { TbSettings } from 'react-icons/tb';

const STORAGE_KEY = 'dashboard-sidebar-width';
const DEFAULT_WIDTH = 250;
const MIN_WIDTH = 160;
const MAX_WIDTH = 480;

const SideBar = () => {
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
      className="relative h-full shrink-0 border-r flex flex-col gap-4 p-3 border-white/10"
      style={{ width }}
    >
      {sideBarItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2 px-2 rounded-md text-white/80 hover:text-white transition-colors min-w-0"
        >
          <item.icon className="text-md shrink-0" />
          <span className="text-sm truncate">{item.label}</span>
        </Link>
      ))}
      <button
        type="button"
        aria-label="Resize sidebar"
        onPointerDown={onResizePointerDown}
        className="absolute top-0 -right-1 w-3 h-full cursor-col-resize hover:bg-white/6 active:bg-white/10 border-0 p-0 bg-transparent touch-none"
      />
    </div>
  );
};

export default SideBar;

const sideBarItems = [
  {
    label: 'Projects',
    icon: GrProjects,
    href: '/dashboard/projects',
  },
  {
    label: 'Deployments',
    icon: AiOutlineDeploymentUnit,
    href: '/dashboard/deployments',
  },
  {
    label: 'Logs',
    icon: LuLogs,
    href: '/dashboard/logs',
  },
  {
    label: 'Analytics',
    icon: TbBrandGoogleAnalytics,
    href: '/dashboard/settings',
  },
  {
    label: 'Settings',
    icon: TbSettings,
    href: '/dashboard/settings',
  },
];
