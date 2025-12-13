"use client";  // This makes it a Client Component

import dynamic from 'next/dynamic';

const WineryMap = dynamic(() => import('./WineryMap'), {
  ssr: false,
  loading: () => <p className="text-center py-20 text-[#6B2737]">Loading interactive map...</p>,
});

export default function MapSection() {
  return <WineryMap />;
}