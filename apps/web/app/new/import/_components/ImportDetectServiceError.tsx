type ImportDetectServiceErrorProps = {
  message?: string;
};

export function ImportDetectServiceError({ message = 'Could not load build metadata. Try again in a moment.' }: ImportDetectServiceErrorProps) {
  return (
    <div
      className="mt-8 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[13px] text-red-200/90"
      role="alert"
    >
      {message}
    </div>
  );
}
