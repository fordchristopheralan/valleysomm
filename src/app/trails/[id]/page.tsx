'use client';

import React, { useState } from 'react';
import { Wine, Clock, MapPin, Share2, Sparkles, ExternalLink, ChevronLeft, Navigation } from 'lucide-react';
import type { AITrailResponse } from '@/lib/types';
import { getWineryById } from '@/lib/wineries';
import Link from 'next/link';

type TrailResultsProps = {
  trail: AITrailResponse;
  onReset?: () => void;
};

export default function TrailResults({ trail, onReset }: TrailResultsProps) {
  const [saved, setSaved] = useState(false);

  const handleShare = async () => {
    if (trail.id) {
      try {
        await fetch(`/api/trails/${trail.id}/share`, { method: 'POST' });
      } catch (error) {
        console.error('Failed to track share:', error);
      }
    }
    
    const url = window.location.href;
    const text = `Check out my ${trail.trailName} wine trail in Yadkin Valley!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: trail.trailName, text, url });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // ==== NEW: Google Maps Multi-Stop Link ====
  const buildGoogleMapsLink = () => {
    const orderedWineries = trail.wineries
      .map(stop => getWineryById(stop.wineryId))
      .filter(Boolean) as { latitude: number; longitude: number }[];

    if (orderedWineries.length < 2) return null;

    const intermediates = orderedWineries.slice(0, -1);
    const destination = orderedWineries[orderedWineries.length - 1];

    const waypoints = intermediates
      .map(w => `${w.latitude},${w.longitude}`)
      .join('|');

    const params = new URLSearchParams({
      api: '1',
      travelmode: 'driving',
      destination: `${destination.latitude},${destination.longitude}`,
    });

    if (waypoints) params.append('waypoints', waypoints);

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const mapsUrl = buildGoogleMapsLink();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        {onReset && (
          <button
            onClick={onReset}
            className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Plan Another Trail
          </button>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 print:shadow-none">
          {/* ... existing header content unchanged ... */}

          {/* Action Buttons - Updated with Navigation */}
          <div className="flex flex-wrap gap-3 mt-6 print:hidden">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] py-3 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Open Full Trail in Google Maps
              </a>
            )}
            <button
              onClick={handleShare}
              className="flex-1 min-w-[200px] py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {saved ? '✓ Link Copied!' : 'Share Trail'}
            </button>
            <button
              onClick={handlePrint}
              className="py-3 px-6 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              📄 Print
            </button>
          </div>
        </div>

        {/* Wineries List - unchanged */}
        {/* ... existing wineries map ... */}

        {/* Map Placeholder - minor update */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-before-page">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Your Route Map
          </h3>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center print:hidden">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Interactive map coming soon</p>
              <p className="text-sm mt-1">Tap the green button above for turn-by-turn navigation</p>
            </div>
          </div>
        </div>

        {/* Tips Section - Winter Optimized for Dec 2025 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ❄️ Winter Tips for Your Yadkin Valley Trail (December 2025)
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Many wineries open later on Sundays (noon or 1 PM) and close at 5 PM — plan a midday start to fit everything in before sunset (~5:15 PM)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Focus on cozy indoor tastings — hearty reds shine in cooler weather, and places like Childress & Shelton often have holiday decorations or events</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Always call ahead or check websites/Facebook for exact hours & reservations (especially Raffaldini & busy spots)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Dress in layers — it can be chilly on the hills, even if sunny</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Designate a driver or book a tour — roads are scenic but winding</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Fewer crowds in winter = more personal attention from staff!</span>
            </li>
          </ul>
        </div>

        {/* ... rest of component unchanged ... */}
      </div>
    </div>
  );
}