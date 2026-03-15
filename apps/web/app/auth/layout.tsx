import Image from 'next/image';
import React from 'react';
import svgLogo from '@/public/logo.svg';
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center text-white bg-[#060B10] w-full min-h-screen">
      <div className="w-[90%] mx-auto py-6 flex items-center shrink-0">
        <Image className="w-28" src={svgLogo} alt="Render Lite Logo" width={1200} height={1200} />
      </div>
      <main className="flex-1 flex w-full items-center justify-center">
        {children}
      </main>
      <footer className="w-[90%] mx-auto py-6 flex items-center justify-center shrink-0">
        <h1 className="font-bold text-xl text-white/90">Render Lite</h1>
      </footer>
    </div>
  );
};

export default Layout;
