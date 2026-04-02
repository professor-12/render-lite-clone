function FieldSkeleton({ withHint }: { withHint?: boolean }) {
  return (
    <div>
      <div className="h-[13px] w-28 rounded bg-white/8 mb-1.5 animate-pulse" />
      <div className="w-full h-[42px] rounded-lg border border-white/8 bg-[#111111] px-3.5 flex items-center">
        <div className="h-3.5 flex-1 max-w-[min(100%,20rem)] rounded bg-white/6 animate-pulse" />
      </div>
      {withHint ? (
        <div className="mt-1.5 h-3 w-48 rounded bg-white/5 animate-pulse" />
      ) : null}
    </div>
  );
}

function IconInputRowSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#111111]">
      <div className="size-[15px] shrink-0 rounded bg-white/6 animate-pulse" />
      <div className="h-3.5 flex-1 rounded bg-white/6 animate-pulse" />
    </div>
  );
}

/**
 * Mirrors ImportDeployForm + DeployProjectFooter layout while build metadata is loading.
 */
export function ImportBuildMetadataSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-busy="true" aria-label="Loading build settings">
      <FieldSkeleton withHint />

      <div>
        <div className="h-[13px] w-32 rounded bg-white/8 mb-1.5 animate-pulse" />
        <IconInputRowSkeleton />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-[13px] w-16 rounded bg-white/8 mb-1.5 animate-pulse" />
          <IconInputRowSkeleton />
        </div>
        <div>
          <div className="h-[13px] w-28 rounded bg-white/8 mb-1.5 animate-pulse" />
          <IconInputRowSkeleton />
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-[#111111] divide-y divide-white/6 overflow-hidden">
        <div className="px-4 py-4 space-y-3">
          <div className="h-[13px] w-24 rounded bg-white/8 animate-pulse" />
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a]">
            <div className="mt-2 size-[15px] shrink-0 rounded bg-white/6 animate-pulse" />
            <div className="min-h-[5.25rem] flex-1 rounded bg-white/6 animate-pulse" />
          </div>
          <div className="h-3 w-[min(100%,14rem)] rounded bg-white/5 animate-pulse" />
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="h-[13px] w-28 rounded bg-white/8 animate-pulse" />
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a]">
            <div className="mt-2 size-[15px] shrink-0 rounded bg-white/6 animate-pulse" />
            <div className="min-h-[5.25rem] flex-1 rounded bg-white/6 animate-pulse" />
          </div>
          <div className="h-3 w-[min(100%,18rem)] rounded bg-white/5 animate-pulse" />
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="h-[13px] w-28 rounded bg-white/8 animate-pulse" />
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg border border-white/8 bg-[#0a0a0a]">
            <div className="mt-2 size-[15px] shrink-0 rounded bg-white/6 animate-pulse" />
            <div className="min-h-[5.25rem] flex-1 rounded bg-white/6 animate-pulse" />
          </div>
          <div className="h-3 w-[min(100%,16rem)] rounded bg-white/5 animate-pulse" />
        </div>
      </div>

      <div className="mt-10 h-12 w-full rounded-lg bg-white/8 animate-pulse" />
      <div className="mt-5 mx-auto h-3 w-64 rounded bg-white/5 animate-pulse" />
    </div>
  );
}
