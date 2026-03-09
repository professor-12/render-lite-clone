'use client';
import { redirect } from 'next/navigation';
import { use, useState } from 'react';

import { FaGithub } from 'react-icons/fa6';

const authOptions = ['login', 'register'] as const;

const Login = ({ params }: { params: Promise<{ auth: string }> }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { auth } = use(params);
  if (!authOptions.includes(auth as (typeof authOptions)[number])) {
    return redirect('/auth/login');
  }
  function openAuthWindow(url: string) {
    if (isAuthenticating) return;
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      url,
      'GoogleSignIn',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
    );
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'oauth_success') {
        console.log('Login successful');
        window.location.href = '/';
      }

      if (event.data.type === 'oauth_error') {
        alert('Authentication failed: ' + event.data.error);
        console.error('OAuth error:', event.data.error);
      }

      setIsAuthenticating(false);
    });
  }
  return (
    <div className="space-y-5 text-sm w-full text-center text-white max-w-sm">
      <h1 className="text-3xl">{auth == 'login' ? 'Log in' : 'Register'}</h1>
      <button className="w-full p-2 flex items-center justify-center gap-2 border rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 201 205"
          fill="none"
        >
          <g clip-path="url(#clip0_106_2044)">
            <path
              d="M200.92 104.941C200.92 98.0524 200.253 90.9413 199.142 84.2747H102.92V123.608H158.031C155.809 136.275 148.475 147.386 137.587 154.497L170.475 180.052C189.809 162.052 200.92 135.83 200.92 104.941Z"
              fill="#4280EF"
            />
            <path
              d="M102.92 204.497C130.476 204.497 153.587 195.386 170.475 179.83L137.587 154.497C128.476 160.719 116.698 164.275 102.92 164.275C76.2533 164.275 53.8088 146.275 45.5866 122.275L11.8088 148.275C29.1422 182.719 64.2533 204.497 102.92 204.497Z"
              fill="#34A353"
            />
            <path
              d="M45.5867 122.053C41.3645 109.386 41.3645 95.6084 45.5867 82.9417L11.8089 56.7195C-2.63552 85.6084 -2.63552 119.608 11.8089 148.275L45.5867 122.053Z"
              fill="#F6B704"
            />
            <path
              d="M102.92 40.9418C117.364 40.7195 131.587 46.2751 142.031 56.2751L171.142 26.9418C152.698 9.6084 128.253 0.275064 102.92 0.497287C64.2533 0.497287 29.1422 22.2751 11.8088 56.7195L45.5866 82.9418C53.8088 58.7195 76.2533 40.9418 102.92 40.9418Z"
              fill="#E54335"
            />
          </g>
          <defs>
            <clipPath id="clip0_106_2044">
              <rect
                width="200"
                height="204.444"
                fill="white"
                transform="translate(0.920166 0.275146)"
              />
            </clipPath>
          </defs>
        </svg>
        Continue with Google
      </button>
      <div
        onClick={() => {
          openAuthWindow(
            `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo read:user&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}`,
          );
          setIsAuthenticating(true);
        }}
        className="w-full cursor-pointer"
      >
        <button className="w-full p-2 flex items-center cursor-pointer justify-center gap-2 border rounded-lg">
          <FaGithub size={20} />
          Continue with Github
        </button>
      </div>
    </div>
  );
};

export default Login;
