function SkeletonBar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ''}`} aria-hidden />;
}

export function ProjectCardSkeleton() {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex gap-3.5">
        <SkeletonBar className="size-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBar className="h-4 w-[min(100%,14rem)]" />
              <SkeletonBar className="h-3 w-[min(100%,11rem)]" />
            </div>
            <SkeletonBar className="size-6 rounded-full" />
          </div>
          <div className="mt-3">
            <SkeletonBar className="h-6 w-[min(100%,220px)] rounded-full" />
          </div>
          <SkeletonBar className="mt-3 h-3 w-[min(100%,10rem)]" />
          <div className="mt-3 flex gap-2">
            <SkeletonBar className="h-3 w-14" />
            <SkeletonBar className="h-3 w-20" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <SkeletonBar className="h-8 w-48" />
        <SkeletonBar className="h-3 w-64" />
      </div>
      <div className="mb-6 flex items-center gap-2.5">
        <SkeletonBar className="h-9 w-[min(100%,360px)] rounded-full" />
        <SkeletonBar className="h-9 w-24 rounded-full" />
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <ProjectCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
