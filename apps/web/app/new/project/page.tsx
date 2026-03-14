import { Metadata } from 'next';
import React from 'react';
import Header from './_components/Header';

export const metadata: Metadata = {
  title: 'New project | RenderLite',
};

const Page = () => {
  return (
    <div className="">
      <header className="flex w-full justify-between items-center px-6 h-16 border-b border-gray-300/40">
        <div>Back</div>
        <h1 className="text-sm">New Project</h1>
        {/* ProfileButton */}
        <div className="size-6 rounded-full border"></div>
      </header>
      <Header />
    </div>
  );
};

export default Page;
