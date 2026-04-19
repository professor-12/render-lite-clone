import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { FiChevronLeft } from 'react-icons/fi';

import SideBar from './_components/SideBar';
import { ModeToggle } from '@/components/mode-toggle';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('renderLite-access')?.value;

  if (!token) redirect('/auth/login');

  return (
    <section className="min-h-screen bg-[#FAFAFA] dark:bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <FiChevronLeft className="text-[15px]" />
          Back
        </Link>
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground">Dashboard</div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <button
            type="button"
            className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/40 transition-colors hover:bg-muted/60"
          >
            <span className="text-[11px] font-semibold text-muted-foreground">XS</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)] pt-14">
        <SideBar />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </section>
  );
}
