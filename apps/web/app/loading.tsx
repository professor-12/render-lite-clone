import Image from 'next/image';
import React from 'react';

const Loading = () => {
  return (
    <div className="h-screen flex bg-[#060B10] justify-center items-center">
      <Image
        src="/logo.svg"
        alt="Render Lite Logo"
        width={2200}
        height={2200}
        className="w-28 animate-pulse"
      />
    </div>
  );
};

export default Loading;
