function FieldSkeleton({ withHint }: { withHint?: boolean }) {
  return (
    <div>
      <div className="mb-2 h-3 w-28 animate-pulse rounded bg-white/[0.06]" />
      <div className="flex h-12 w-full items-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-4">
        <div className="h-3.5 max-w-[min(100%,20rem)] flex-1 animate-pulse rounded bg-white/[0.06]" />
      </div>
      {withHint ? <div className="mt-2 h-3 w-48 animate-pulse rounded bg-white/[0.04]" /> : null}
    </div>
  );
}

function IconInputRowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-white/[0.06]" />
      <div className="h-3.5 flex-1 animate-pulse rounded bg-white/[0.06]" />
    </div>
  );
}

export function ImportBuildMetadataSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-busy="true" aria-label="Loading build settings">
      <FieldSkeleton withHint />

      <div>
        <div className="mb-2 h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
        <IconInputRowSkeleton />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
          <IconInputRowSkeleton />
        </div>
        <div>
          <div className="mb-2 h-3 w-28 animate-pulse rounded bg-white/[0.06]" />
          <IconInputRowSkeleton />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 px-5 py-5">
            <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
            <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3">
              <div className="mt-1.5 h-4 w-4 shrink-0 animate-pulse rounded bg-white/[0.06]" />
              <div className="min-h-21 flex-1 animate-pulse rounded bg-white/[0.04]" />
            </div>
            <div className="h-3 w-[min(100%,14rem)] animate-pulse rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      <div className="mt-10 h-12 w-full animate-pulse rounded-full bg-white/[0.06]" />
      <div className="mx-auto mt-5 h-3 w-64 animate-pulse rounded bg-white/[0.04]" />
    </div>
  );
}
