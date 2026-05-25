import { AlertCircle } from 'lucide-react';

type ImportDetectServiceErrorProps = {
  message?: string;
};

export function ImportDetectServiceError({
  message = 'Could not load build metadata. Try again in a moment.',
}: ImportDetectServiceErrorProps) {
  return (
    <div
      className="mt-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5 text-[13px] text-red-200/90"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      {message}
    </div>
  );
}
