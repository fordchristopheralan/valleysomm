'use client';

import { useEffect } from 'react';
import { MapPinOff } from 'lucide-react';

export default function TrailDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Trail detail error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <MapPinOff className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Trail Unavailable
        </h2>
        <p className="text-gray-600 mb-6">
          This trail couldn't be loaded. The trail may have expired or the ID is invalid.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
          <a
            href="/"
            className="block w-full bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Plan a New Trail
          </a>
        </div>
      </div>
    </div>
  );
}