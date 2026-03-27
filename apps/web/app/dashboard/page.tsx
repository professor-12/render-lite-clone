import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RiAddLine, RiBarChartLine, RiFlashlightLine, RiGitRepositoryLine, RiRocket2Line, RiSearchLine } from '@remixicon/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const projects = [
  { name: 'render-lite-clone-web', branch: 'main', status: 'Deployed', updated: '2h ago', owner: 'professor-12' },
  { name: 'render-lite-clone-server', branch: 'main', status: 'Building', updated: '8m ago', owner: 'professor-12' },
  { name: 'client', branch: 'main', status: 'Failed', updated: '1d ago', owner: 'hgstechyjaunt' },
];

function StatusPill({ status }: { status: string }) {
  const styleByStatus: Record<string, string> = {
    Deployed: 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.2)] text-[#4ade80]',
    Building: 'bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.2)] text-[#60a5fa]',
    Failed: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#fb7185]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${styleByStatus[status] ?? 'bg-white/5 border-white/10 text-[#888]'}`}
    >
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('renderLite-access')?.value;

  if (!token) redirect('/auth/login');

  return (
    <main className="dark min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      {/* Top bar (matches existing landing dark styling) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/8">
        <div className="mx-auto flex max-w-290 items-center justify-between px-6 h-15">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-[15px] tracking-tight text-white">
            <span className="block h-2.5 w-2.5 rounded-full bg-white" />
            renderlite
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/new/project"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-1.75 text-[13px] font-medium text-white transition-all"
            >
              <RiAddLine size={16} />
              New Project
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-15 mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[230px_1fr]">
        <aside className="rounded-xl border border-white/8 bg-[#0a0a0a]/60 backdrop-blur-md p-4">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <RiBarChartLine size={16} className="text-white/70" />
            </div>
            <p className="text-sm font-semibold">Dashboard</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5 text-sm text-white"
            >
              <RiBarChartLine size={16} />
              Overview
            </Link>
            <Link
              href="/new/project"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#888] hover:text-white hover:bg-white/5 hover:border-white/8 border border-transparent transition-colors"
            >
              <RiRocket2Line size={16} />
              New Project
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#888] hover:text-white hover:bg-white/5 hover:border-white/8 border border-transparent transition-colors"
            >
              <RiGitRepositoryLine size={16} />
              Projects
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#888] hover:text-white hover:bg-white/5 hover:border-white/8 border border-transparent transition-colors"
            >
              <RiFlashlightLine size={16} />
              Deployments
            </Link>
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[18px] font-semibold tracking-tight">Overview</h1>
              <p className="mt-1 text-[13px] text-[#888]">Your projects, build status, and deployment activity.</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/new/project"
                className="inline-flex items-center gap-2 rounded-lg bg-white text-black text-[13px] font-semibold px-4 py-2 hover:bg-[#e8e8e8] transition-all"
              >
                <RiAddLine size={16} />
                Add
              </Link>
            </div>
          </div>

          <Card className="border border-white/8 bg-white/[0.02]">
            <CardHeader className="pb-4">
              <CardTitle className="text-[13px] font-semibold text-[#f0f0f0] tracking-tight">Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <RiSearchLine className="pointer-events-none absolute left-3 top-2.5 text-[#555]" size={16} />
                <Input className="pl-9 bg-transparent border border-white/10" placeholder="Search projects..." />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className="group rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4 transition-all hover:bg-white/[0.04] hover:border-white/14"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#f0f0f0] truncate">{project.name}</p>
                        <p className="mt-1 text-[11px] text-[#555] truncate">{project.owner}</p>
                      </div>
                      <StatusPill status={project.status} />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-[#666]">
                      <span className="font-mono">{project.branch}</span>
                      <span>Updated {project.updated}</span>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-white/12 bg-transparent hover:bg-white/5 hover:text-white text-[#888] justify-center"
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
