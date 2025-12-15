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
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrail = async () => {
      const trailId = params.id as string;
      
      try {
        // First try to fetch from database
        const response = await fetch(`/api/trails/${trailId}`);
        
        if (response.ok) {
          const data = await response.json();
          setTrail(data);
          
          // Track view
          await fetch(`/api/trails/${trailId}/view`, { method: 'POST' });
        } else {
          // Fallback to localStorage for backward compatibility
          const stored = localStorage.getItem(`trail_${trailId}`);
          if (stored) {
            setTrail(JSON.parse(stored));
          } else {
            throw new Error('Trail not found');
          }
        }
      } catch (err) {
        console.error('Failed to load trail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrail();
  }, [params.id]);

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

  if (error || !trail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Trail Not Found</h1>
          <p className="text-gray-600 mb-6">
            This trail doesn't exist or may have been deleted.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Create a New Trail
          </button>
        </div>
      </div>
    );
  }

  return <TrailResults trail={trail} />;
}