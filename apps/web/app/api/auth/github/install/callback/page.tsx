'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

type InstallResult =
  | { status: 'loading' }
  | { status: 'success'; installationId?: string; account?: string }
  | { status: 'error'; error: string };

function runScriptLogic(result: Exclude<InstallResult, { status: 'loading' }>) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (result.status === 'success') {
    window.opener?.postMessage(
      {
        type: 'github_install_success',
        ...(result.installationId && { installationId: result.installationId }),
        ...(result.account && { account: result.account }),
      },
      origin,
    );
  } else {
    window.opener?.postMessage({ type: 'github_install_error', error: result.error }, origin);
  }
  window.close();
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<InstallResult>({ status: 'loading' });
  const scriptRanRef = useRef(false);

  useEffect(() => {
    const installationId =
      searchParams.get('installation_id') ?? searchParams.get('installationId');
    const code = searchParams.get('code');

    if (!installationId || !code) {
      queueMicrotask(() =>
        setResult({ status: 'error', error: 'Missing installation_id or code' }),
      );
      return;
    }

    const controller = new AbortController();

    fetch(
      `/api/auth/github/install?installation_id=${encodeURIComponent(installationId)}&code=${encodeURIComponent(code)}`,
      { credentials: 'include', signal: controller.signal },
    )
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResult({
            status: 'error',
            error: (data as { error?: string }).error ?? 'Failed to install GitHub app',
          });
          return;
        }
        const payload = data as { success?: boolean; installationId?: string; account?: string };
        if (payload.success) {
          setResult({
            status: 'success',
            installationId: payload.installationId,
            account: payload.account,
          });
        } else {
          setResult({
            status: 'error',
            error: (data as { error?: string }).error ?? 'Installation failed',
          });
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setResult({
          status: 'error',
          error: 'Failed to complete installation',
        });
      });

    return () => controller.abort();
  }, [searchParams]);

  // Run script once we have a result (success or error) and opener exists
  useEffect(() => {
    if (result.status === 'loading' || scriptRanRef.current) return;
    if (typeof window === 'undefined' || !window.opener) return;

    scriptRanRef.current = true;
    runScriptLogic(result);
  }, [result]);

  if (result.status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-[14px] text-[#888]">Completing GitHub app installation…</p>
      </div>
    );
  }

  // After success/error we try to close; show a fallback if still visible
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 p-6">
      <p className="text-[14px] text-[#888]">
        {result.status === 'success'
          ? 'Installation complete. This window should close automatically.'
          : `Error: ${result.error}`}
      </p>
      <button
        type="button"
        onClick={() => window.close()}
        className="text-[13px] text-white/80 hover:text-white underline"
      >
        Close window
      </button>
    </div>
  );
}

function CallbackLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-[14px] text-[#888]">Completing GitHub app installation…</p>
    </div>
  );
}

export default function GitHubInstallCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
