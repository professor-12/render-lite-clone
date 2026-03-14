
import { Metadata } from 'next';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';
import Header from './_components/Header';
import { useGetUserRepos } from '@/app/queries/github.query';

export const metadata: Metadata = {
  title: 'New project | RenderLite',
};

export default function NewProjectPage() {
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Top nav bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex w-full justify-between items-center px-6 h-14 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">

        {/* Back */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-[13px] text-[#888] hover:text-white transition-colors"
        >
          <FiChevronLeft className="text-[15px]" />
          Back
        </Link>

        {/* Title */}
        <h1 className="text-[13px] font-medium text-[#888] tracking-tight">
          New Project
        </h1>

        {/* Profile avatar */}
        <button className="size-7 rounded-full border border-white/[0.14] bg-[#181818] hover:border-white/30 transition-colors flex items-center justify-center overflow-hidden">
          <span className="text-[11px] font-semibold text-[#888]">XS</span>
        </button>

      </header>

      {/* Page content — offset by header height */}
      <div className="pt-14">
        <Header />
      </div>

    </div>
  );
}