import ProjectLogsClient from '../logs/ui';

type Props = { params: Promise<{ id: string }> };

export default async function ProjectLogsTab({ params }: Props) {
  const { id } = await params;
  return <ProjectLogsClient projectId={id} />;
}

