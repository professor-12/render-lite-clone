import Image from 'next/image';
import React from 'react';
import svgLogo from '@/public/logo.svg';
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-between flex-col items-center text-white bg-[#060B10] w-full h-screen">
      <div className="w-[90%] mx-auto text-white h-18 flex items-center">
        <Image className="w-28" src={svgLogo} alt="Render Lite Logo" width={1200} height={1200} />
      </div>
      {children}
      <div className="w-[90%] mx-auto text-white h-18 flex items-center justify-center">
        <h1 className="font-bold text-xl">Render Lite</h1>
      </div>
    </div>
  );
};

export default Layout;
