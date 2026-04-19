import { ProjectCard } from '@/app/dashboard/_components/ProjectCard';
import { getProjects } from '@/lib/projects/getProjects';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto w-full px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSearch className="text-md text-muted-foreground" />
          <Input type="text" placeholder="Search projects" className="h-9 w-[280px]" />
        </div>
        <Button>
          <Link href="/new/project">New Project</Link>
        </Button>
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
