'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TrailResults from '@/components/TrailResults';
import type { AITrailResponse } from '@/lib/types';

export default function TrailPage() {
  const params = useParams();
  const router = useRouter();
  const [trail, setTrail] = useState<AITrailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trailId = params.id as string;
    const stored = localStorage.getItem(`trail_${trailId}`);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTrail(parsed);
      } catch (error) {
        console.error('Failed to parse trail data:', error);
      }
    }
    
    setLoading(false);
  }, [params.id]);

  const handleReset = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900">Loading your trail...</p>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Trail Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find this trail. It may have been deleted or the link is incorrect.
          </p>
          <button
            onClick={handleReset}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Create a New Trail
          </button>
        </div>
      </div>
    );
  }

  return <TrailResults trail={trail} onReset={handleReset} />;
}