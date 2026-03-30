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
        className={`mt-10 w-full py-3 rounded-lg text-[14px] font-semibold transition-all
              ${
                canDeploy && !deploying
                  ? 'bg-white text-black hover:bg-[#e8e8e8]'
                  : 'bg-white/[0.06] text-[#555] cursor-not-allowed'
              }`}
      >
        {deploying ? 'Deploying…' : 'Deploy Project'}
      </button>

      <p className="mt-5 text-center text-[12px] text-[#444] font-mono">
        SSL and CDN included automatically on every deploy.
      </p>
    </>
  );
}
