'use client';

import React, { useState } from 'react';
import {
  Wine,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Navigation,
} from 'lucide-react';
import type { AITrailResponse } from '@/lib/types';
import { getWineryById } from '@/lib/wineries';

type TrailResultsProps = {
  trail: AITrailResponse;
  onReset?: () => void;
};

export default function TrailResults({ trail, onReset }: TrailResultsProps) {
  const [saved, setSaved] = useState(false);

  // Critical guard for SSR safety
  if (!trail || !trail.wineries || trail.wineries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900">Loading your trail...</p>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (trail?.id) {
      try {
        await fetch(`/api/trails/${trail.id}/share`, { method: 'POST' });
      } catch (error) {
        console.error('Failed to track share:', error);
      }
    }

    const url = window.location.href;
    const text = `Check out my ${trail?.trailName || 'Yadkin Valley'} wine trail!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: trail.trailName, text, url });
      } catch {
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

  const handlePrint = () => window.print();

  // One-click Google Maps navigation
    const buildGoogleMapsLink = () => {
    const orderedWineries = trail.wineries
      .map((stop: { wineryId: string }) => getWineryById(stop.wineryId))
      .filter(Boolean) as { latitude: number; longitude: number }[];

    if (orderedWineries.length < 2) return null;

    const intermediates = orderedWineries.slice(0, -1);
    const destination = orderedWineries[orderedWineries.length - 1];

    const waypoints = intermediates
      .map((w: { latitude: number; longitude: number }) => `${w.latitude},${w.longitude}`)
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
        {/* Back Button */}
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  YOUR CUSTOM TRAIL
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {trail.trailName}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">{trail.summary}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Wine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Stops</p>
                <p className="text-xl font-bold text-gray-900">{trail.totalStops}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-xl font-bold text-gray-900">
                  ~{trail.estimatedDurationHours} hours
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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

        {/* Winter Tips – Updated for December 15, 2025 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            ❄️ Winter Tips for Your Yadkin Valley Trail (December 2025)
          </h3>

          {/* Holiday Vibes Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <img src="https://www.yadkinvalleync.com/media/images/agm_garden_2112-06701-2-web.max-700x500.jpg" alt="Holiday lights display in Yadkin Valley area" className="rounded-lg shadow-md object-cover h-64 w-full" />
            <img src="https://carolinagetawaycabins.com/wp-content/uploads/2024/11/Yadkin-Valley-Lights-.jpg" alt="Festive holiday lights at a Yadkin Valley winery" className="rounded-lg shadow-md object-cover h-64 w-full" />
            <img src="https://carolinagetawaycabins.com/wp-content/uploads/2024/11/Yadkin-Valley-Christmas-Lights.jpg" alt="Christmas lights illuminating Yadkin Valley scenery" className="rounded-lg shadow-md object-cover h-64 w-full" />
            <img src="https://www.yadkinvalleync.com/media/original_images/Fairfield_Inn_Magic_of_Christmas_Elkin_NC.jpg" alt="Magic of Christmas holiday lights in Elkin" className="rounded-lg shadow-md object-cover h-64 w-full" />
          </div>

          <ul className="space-y-3 text-gray-700 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Today is Monday — most wineries are closed or by appointment only (a few open limited hours). Full hours typically Thursday–Sunday. Always verify!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Cozy indoor tastings are perfect — hearty reds shine in winter, with many spots featuring holiday lights & festive events</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>The <strong>Yadkin Valley Winter Wine & Beer Passport</strong> is active (Nov 29, 2024 – March 30, 2025) — tastings at 9 wineries + 3 breweries, plus lodging/food discounts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Call ahead or check websites/Facebook for exact hours & reservations (sunset ~5:15 PM)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Dress in layers and designate a driver — roads are beautiful but winding</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Winter bonus: fewer crowds mean more personal attention from staff!</span>
            </li>
          </ul>

          {/* Dormant Vine Landscapes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <img src="https://www.vaninblack.com/wp-content/uploads/2018/12/Dormant-Overmountain-Vineyard.jpg" alt="Dormant vines in a serene winter vineyard" className="rounded-lg shadow-md object-cover h-64 w-full" />
            <img src="https://www.platypustours.com/wp-content/uploads/2022/01/landscape-g9f857f9b5_1280-1080x675.jpg" alt="Peaceful winter landscape with bare grape vines" className="rounded-lg shadow-md object-cover h-64 w-full" />
            <img src="https://ancientpeaks.com/wp-content/uploads/2024/02/AP_Winter_Vineyard.jpg" alt="Quiet off-season vineyard in winter" className="rounded-lg shadow-md object-cover h-64 w-full" />
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-before-page">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Your Route Map
          </h3>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center print:hidden">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Interactive map coming soon</p>
              <p className="text-sm mt-1">
                Tap the green button above for instant navigation
              </p>
            </div>
          </div>
        </div>

        {/* Winter Tips – Updated for December 14, 2025 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            ❄️ Winter Tips for Your Yadkin Valley Trail (December 2025)
          </h3>

          {/* Holiday Vibes Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          </div>

          <ul className="space-y-3 text-gray-700 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Today is Sunday — most wineries open at noon or 1 PM and close at 5 PM (sunset around 5:15 PM). Plan a midday start!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Cozy indoor tastings are ideal now — hearty reds pair perfectly with the season, and many spots have holiday lights & events</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>The <strong>Yadkin Valley Winter Wine & Beer Passport</strong> is active (through March 30, 2025) — 9 wineries offer tastings + discounts on lodging/food</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Always call ahead or check websites/Facebook for exact hours & reservations (e.g., Childress open earlier; others noon-5)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Dress in layers and designate a driver — roads are beautiful but winding</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Winter bonus: fewer crowds mean more personal attention from staff!</span>
            </li>
          </ul>

          {/* Dormant Vine Landscapes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


          </div>
        </div>

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            className="w-full mt-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all print:hidden"
          >
            Plan Another Trail
          </button>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm print:mt-6">
          <p>Created by Valley Somm • Your AI Wine Trail Guide</p>
          <p className="mt-1">Discover Yadkin Valley, North Carolina</p>
          <p>© 2025 Yadkin Data Partners LLC. All rights reserved.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:break-before-page { break-before: page; }
        }
      `}</style>
    </div>
  );
}