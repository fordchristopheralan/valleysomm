'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function TrailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Trail page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <AlertCircle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Trail Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't load this trail. It may have been removed or the link is incorrect.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="block w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Create New Trail
          </a>
        </div>
      </div>
    </div>
  );
}