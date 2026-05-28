'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { Github, Loader2 } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

const AUTH_OPTIONS = ['login', 'register'] as const;

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;

export default function AuthPage({ params }: { params: Promise<{ auth: string }> }) {
  const { auth } = use(params);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!AUTH_OPTIONS.includes(auth as (typeof AUTH_OPTIONS)[number])) {
    redirect('/auth/login');
  }

  
  const isLogin = auth === 'login';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'oauth_success') {
        if (popupCheckRef.current) clearInterval(popupCheckRef.current);
        popupCheckRef.current = null;
        setIsAuthenticating(false);
        window.location.href = '/dashboard';
      }
      if (event.data?.type === 'oauth_error') {
        if (popupCheckRef.current) clearInterval(popupCheckRef.current);
        popupCheckRef.current = null;
        setIsAuthenticating(false);
        setError(event.data?.error ?? 'Authentication failed');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (popupCheckRef.current) clearInterval(popupCheckRef.current);
    };
  }, []);

  function openAuthWindow(url: string) {
    if (isAuthenticating) return;
    setError(null);
    setIsAuthenticating(true);

    const left = Math.round(window.screen.width / 2 - POPUP_WIDTH / 2);
    const top = Math.round(window.screen.height / 2 - POPUP_HEIGHT / 2);
    const features = `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${top},left=${left},resizable=yes,scrollbars=yes`;

    const popup = window.open(url, 'OAuthPopup', features);
    if (popup) {
      popupCheckRef.current = setInterval(() => {
        if (popup.closed) {
          if (popupCheckRef.current) clearInterval(popupCheckRef.current);
         popupCheckRef.current = null;
         setIsAuthenticating(false)  
        }
      }, 200);
    } else {
      setIsAuthenticating(false);
    }
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo%20read:user&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI ?? '')}`;

  return (
    <div className="flex w-full max-w-[90%] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-9 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-[28px] font-medium leading-tight tracking-[-0.025em] text-brand-cream">
              {isLogin ? (
                <>
                  Welcome <span className="">back</span>
                </>
              ) : (
                <>
                  Create an <span className="font-serif-display italic">account</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-brand-muted-soft">
              {isLogin
                ? 'Sign in to deploy and manage your projects.'
                : 'Get started with Render Lite in seconds.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-[13px] text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Providers */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => openAuthWindow(githubAuthUrl)}
              disabled={isAuthenticating}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-cream px-4 text-[14px] font-medium text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 shrink-0 animate-spin" />
                  <span>Connecting…</span>
                </>
              ) : (
                <>
                  <Github className="h-5 w-5 shrink-0" />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>

            <div className="relative flex items-center gap-3 py-2">
              <span className="h-px flex-1 bg-white/[0.08]" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-muted">
                or
              </span>
              <span className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <button
              type="button"
              disabled={isAuthenticating}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.02] px-4 text-[14px] font-medium text-brand-cream transition-all hover:border-white/25 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SiGoogle className="h-4.5 w-4.5 shrink-0" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-7 text-center text-[10.5px] tracking-wider text-brand-muted">
            By continuing, you agree to our terms & privacy policy.
          </p>
        </div>

        {/* Swap link */}
        <p className="mt-6 text-center text-[13px] text-brand-muted-soft">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link
            href={isLogin ? '/auth/register' : '/auth/login'}
            className="text-brand-orange transition-colors hover:text-brand-orange/80"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
