function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/6 ${className ?? ''}`}
      aria-hidden
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <article className="rounded-lg border border-[#262626] bg-[#0a0a0a] p-5">
      <div className="flex gap-4">
        <SkeletonBar className="size-11 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBar className="h-4 w-[min(100%,14rem)]" />
              <SkeletonBar className="h-3 w-[min(100%,11rem)]" />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <SkeletonBar className="size-9 rounded-full" />
              <SkeletonBar className="size-7 rounded-md" />
            </div>
          </div>
          <div className="mt-3">
            <SkeletonBar className="h-7 w-[min(100%,220px)] rounded-md" />
          </div>
          <SkeletonBar className="mt-2 h-3 w-[min(100%,10rem)]" />
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
    <div className="mx-auto w-full px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBar className="size-4 rounded-sm" />
          <SkeletonBar className="h-10 w-[min(100%,240px)] rounded-md" />
        </div>
        <SkeletonBar className="h-9 w-30 rounded-md" />
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
