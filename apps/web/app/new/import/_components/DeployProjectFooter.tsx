import { ArrowUpRight, Loader2 } from 'lucide-react';

type DeployProjectFooterProps = {
  canDeploy: boolean;
  deploying: boolean;
  onDeploy: () => void;
};

export function DeployProjectFooter({ canDeploy, deploying, onDeploy }: DeployProjectFooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onDeploy}
        disabled={!canDeploy || deploying}
        className={`group mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-medium transition-all
          ${
            canDeploy && !deploying
              ? 'bg-brand-orange text-white shadow-[0_10px_40px_-10px_rgba(251,92,28,0.5)] hover:opacity-95'
              : 'cursor-not-allowed bg-white/[0.06] text-brand-muted'
          }`}
      >
        {deploying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Deploying…
          </>
        ) : (
          <>
            Deploy project
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </>
        )}
      </button>

      <p className="mt-6 text-center font-mono text-[11.5px] uppercase tracking-[0.14em] text-brand-muted">
        SSL &amp; CDN included automatically on every deploy.
      </p>
    </>
  );
}
