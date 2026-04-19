import { ProjectDeploymentView } from './ui';

type Props = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  return <ProjectDeploymentView projectId={id} />;
}
