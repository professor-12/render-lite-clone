'use client';
import React from 'react';

const Page = ({
  params,
  searchParams,
}: {
  params: Promise<{ installationId: string }>;
  searchParams: Promise<Record<string, string>>;
}) => {
  return <div>Page</div>;
};

export default Page;
