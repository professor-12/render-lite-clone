import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { ArrowLeft, Search, Bell } from 'lucide-react';

import SideBar from './_components/SideBar';
import { ModeToggle } from '@/components/mode-toggle';
import { SocketProvider } from '@/providers/SocketProvider';

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-dashboard-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-dashboard-mono',
  display: 'swap',
});

function RenderLiteMark() {
  return (
    <span className="relative inline-flex h-6 w-6 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-foreground" />
      <span className="absolute inset-[3px] rounded-full bg-background" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-foreground" />
    </span>
  );
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('renderLite-access')?.value;

  if (!token) redirect('/auth/login');

  return (
    <SocketProvider>
      <section
        className={`${interTight.variable} ${jetbrainsMono.variable} dashboard-shell min-h-screen bg-background text-foreground`}
      >
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[14px] font-medium tracking-tight text-foreground"
            >
              <RenderLiteMark />
              <span className="flex items-baseline gap-1">
                renderLite
              </span>
            </Link>
            <span className="h-5 w-px bg-border" />
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center px-6 md:flex">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects, deployments…"
                className="h-8 w-full rounded-full border border-border bg-muted/50 pl-9 pr-3 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </button>
            <ModeToggle />
            <button
              type="button"
              className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-orange)]/15 ring-1 ring-[var(--brand-orange)]/25 transition-all hover:ring-[var(--brand-orange)]/50"
            >
              <span className="text-[11px] font-medium text-[var(--brand-orange)]">XS</span>
            </button>
          </div>
        </header>

        <div className="flex h-[calc(100vh-3.5rem)] pt-14">
          <SideBar />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </section>
    </SocketProvider>
  );
}
