import { DeploymentLogsView } from './ui';

type Props = { params: Promise<{ deploymentId: string }> };

export default async function DeploymentPage({ params }: Props) {
  const { deploymentId } = await params;
  return <DeploymentLogsView deploymentId={deploymentId} />;
}

