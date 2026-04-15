type Props = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-lg font-semibold text-white">Project</h1>
      <p className="mt-2 text-sm text-[#737373]">ID: {id}</p>
    </div>
  );
}
