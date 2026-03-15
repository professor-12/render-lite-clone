'use client';

import { useRef, useEffect, useState } from 'react';

const GITHUB_INSTALL_URL = 'https://github.com/apps/renderlite/installations/select_target';
const POPUP_NAME = 'github-app-install';
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;

type ConnectGitHubPopupButtonProps = {
  className?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
};

export default function ConnectGitHubPopupButton({
  className,
  children,
  onSuccess,
}: ConnectGitHubPopupButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const t = event.data?.type;
      if (t === 'github_install_success') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsOpening(false);
        onSuccess?.();
      }
      if (t === 'github_install_error' || t === 'github_install_cancel') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsOpening(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onSuccess]);

  const openPopup = () => {
    if (isOpening) return;
    setIsOpening(true);
    const left = Math.round(window.screen.width / 2 - POPUP_WIDTH / 2);
    const top = Math.round(window.screen.height / 2 - POPUP_HEIGHT / 2);
    const features = `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${top},left=${left},resizable=yes,scrollbars=yes`;
    const popup = window.open(GITHUB_INSTALL_URL, POPUP_NAME, features);
    if (popup) {
      intervalRef.current = setInterval(() => {
        if (popup.closed) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsOpening(false);
        }
      }, 200);
    } else {
      setIsOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={openPopup}
      disabled={isOpening}
      className={className}
    >
      {isOpening ? '✓ Opening…' : children}
    </button>
  );
}
