import { ProjectCard } from '@/app/dashboard/_components/ProjectCard';
import { getProjects } from '@/lib/projects/getProjects';
import Link from 'next/link';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto w-full px-6 py-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[28px] font-medium tracking-[-0.025em] text-foreground">
            Your <span className="">projects</span>
          </h1>
          <Link
            href="/new/project"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>
        <p className="text-[13.5px] text-muted-foreground">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'} · deployed across
          the edge
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px] max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects"
            className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]">
            <Plus className="h-5 w-5" />
          </div>
          <h3 className="mb-1.5 text-[16px] font-medium text-foreground">
            No projects yet
          </h3>
          <p className="mb-5 max-w-sm text-[13px] text-muted-foreground">
            Connect a GitHub repository or start from a template to deploy your first project.
          </p>
          <Link
            href="/new/project"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create first project
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
