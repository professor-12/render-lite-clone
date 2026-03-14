'use client';
import { MdInsertLink } from 'react-icons/md';
import React, { useRef, useState } from 'react';
import GithubRepo from './GithubRepo';
import Template from './Template';

const Header = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  // const githubRepoRegex = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
  // const urlIsValid = githubRepoRegex.test(url);
  return (
    <>
      <main className="bg-[#FAFAFA] min-h-screen py-12 pt-20">
        <div className="max-w-6xl w-full mx-auto">
          <h1 className="text-4xl font-semibold tracking-tight">Let&apos;s build something new</h1>
          <div
            onClick={() => {
              if (inputRef) inputRef.current?.focus?.();
            }}
            className="flex border px-3 items-center text-lg gap-2 focus-within:ring-neutral-600/50 focus-within:ring-2 ring-offset-2 rounded-lg mt-6"
          >
            <MdInsertLink className="text-2xl text-gray-700/65" />
            <input
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              ref={inputRef}
              type="text"
              placeholder="Enter a github repository url.."
              className="py-3 focus:border-0 focus:outline-0 flex-1"
            />
            {url.trim().length > 0 && (
              <button className="bg-black text-white text-sm p-2 px-3 rounded-md">Deploy</button>
            )}
          </div>
          <div className="mt-20  border-t  border-gray-300/50 w-full h-12 divide-x-2 divide-gray-300/50 flex">
            <div className="flex-1">
              <GithubRepo />
            </div>
            <div className="flex-1">
              <Template />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Header;
