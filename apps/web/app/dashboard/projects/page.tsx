import { ProjectCard } from '@/app/dashboard/_components/ProjectCard';
import { getProjects } from '@/lib/projects/getProjects';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto w-full px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSearch className="text-md text-white" />
          <input
            type="text"
            placeholder="Search projects"
            className="rounded-md border border-white/10 bg-transparent p-2 text-[14px] text-white"
          />
        </div>
        <Link
          href="/new/project"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
        >
          New Project
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li key={p.id}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
