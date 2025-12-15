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
      .map((stop) => getWineryById(stop.wineryId))
      .filter(Boolean) as { latitude: number; longitude: number }[];

    if (orderedWineries.length < 2) return null;

    const intermediates = orderedWineries.slice(0, -1);
    const destination = orderedWineries[orderedWineries.length - 1];

    const waypoints = intermediates
      .map((w) => `${w.latitude},${w.longitude}`)
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

        {/* Wineries List - Now Fully Dynamic! */}
        <div className="space-y-8 mb-8">
          {trail.wineries
            .map((stop) => ({
              stop,
              winery: getWineryById(stop.wineryId),
            }))
            .filter((item): item is { stop: typeof trail.wineries[0]; winery: NonNullable<ReturnType<typeof getWineryById>> } => 
              item.winery !== undefined
            )
            .map(({ stop, winery }, index) => (
              <div
                key={stop.wineryId}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl print:shadow-none print:break-inside-avoid"
              >
                {/* Winery Hero Image */}
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                  <img
                    src={
                      winery.id === 'jolo'
                        ? 'https://www.yadkinvalleync.com/media/original_images/jolo_vineyards_001a.jpg'
                        : winery.id === 'laurel-gray'
                        ? 'https://ncwine.org/wp-content/uploads/laurel-gray.jpg'
                        : winery.id === 'raffaldini'
                        ? 'https://assets.simpleviewinc.com/simpleview/image/upload/crm/winstonsalemnc/Raffaldini-Tuscan-Villa_cmyk_l_81BA8422-5056-A36A-0751D722BAA12CE1-81ba837a5056a36_81ba847d-5056-a36a-078c808a0aac31d5.jpg'
                        : 'https://via.placeholder.com/800x400?text=' + winery.name
                    }
                    alt={winery.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                    <span className="text-2xl font-bold text-purple-600">#{stop.order}</span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{winery.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" />
                        Suggested arrival: {stop.suggestedArrivalTime}
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-6">{winery.description}</p>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                    <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Why Valley Somm picked this for you:
                    </p>
                    <p className="text-purple-800">{stop.whyItsIncluded}</p>
                  </div>

                  {/* What to Try */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <p className="font-semibold text-gray-900 mb-2">🍷 What to try:</p>
                    <p className="text-gray-700">{stop.whatToTry}</p>
                  </div>

                  {/* Tags & Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {winery.vibeTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {winery.scenic && (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Scenic views
                      </span>
                    )}
                    {winery.lunchNearby && (
                      <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        🍽️ Lunch nearby
                      </span>
                    )}
                  </div>

                  {/* Website Link */}
                  {winery.website && (
                    <a
                      href={winery.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors print:hidden"
                    >
                      Visit Website
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Winter Tips – Updated for December 15, 2025 (Monday) */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 print:break-inside-avoid">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            ❄️ Winter Tips for Your Yadkin Valley Trail (December 2025)
          </h3>

          {/* Holiday Lights Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <img src="https://www.yadkinvalleync.com/media/images/agm_garden_2112-06701-2-web.max-700x500.jpg" alt="Holiday lights in Yadkin Valley" className="rounded-xl shadow-lg object-cover h-80 w-full" />
            <img src="https://carolinagetawaycabins.com/wp-content/uploads/2024/11/Yadkin-Valley-Lights-.jpg" alt="Festive winery holiday lights" className="rounded-xl shadow-lg object-cover h-80 w-full" />
            <img src="https://carolinagetawaycabins.com/wp-content/uploads/2024/11/Yadkin-Valley-Christmas-Lights.jpg" alt="Christmas lights in the valley" className="rounded-xl shadow-lg object-cover h-80 w-full" />
            <img src="https://www.yadkinvalleync.com/media/original_images/Fairfield_Inn_Magic_of_Christmas_Elkin_NC.jpg" alt="Magic of Christmas in Elkin" className="rounded-xl shadow-lg object-cover h-80 w-full" />
          </div>

          <ul className="space-y-4 text-gray-700 text-lg mb-8">
            <li className="flex items-start gap-4">
              <span className="text-purple-600 font-bold text-xl">•</span>
              <span>Today is <strong>Monday</strong> — most wineries are closed or by appointment only (a few open limited hours). Full hours typically Thursday–Sunday. Always check ahead!</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-purple-600 font-bold text-xl">•</span>
              <span>Cozy indoor tastings are perfect — hearty reds shine in winter, with many spots glowing with holiday lights & festive events</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-purple-600 font-bold text-xl">•</span>
              <span>The <strong>Yadkin Valley Winter Wine & Beer Passport</strong> is active (Nov 29, 2024 – March 30, 2025) — tastings at 9 wineries + 3 breweries, plus lodging/food discounts</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-purple-600 font-bold text-xl">•</span>
              <span>Call ahead or check websites/Facebook for exact hours (sunset ~5:15 PM)</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-purple-600 font-bold text-xl">•</span>
              <span>Dress in layers and designate a driver — roads are beautiful but winding</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-purple-600 font-bold text-xl">•</span>
              <span>Winter bonus: fewer crowds = more personal attention from staff!</span>
            </li>
          </ul>

          {/* Dormant Vines Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img src="https://www.vaninblack.com/wp-content/uploads/2018/12/Dormant-Overmountain-Vineyard.jpg" alt="Dormant vines in winter" className="rounded-xl shadow-lg object-cover h-64 w-full" />
            <img src="https://www.platypustours.com/wp-content/uploads/2022/01/landscape-g9f857f9b5_1280.jpg" alt="Peaceful winter vineyard" className="rounded-xl shadow-lg object-cover h-64 w-full" />
            <img src="https://ancientpeaks.com/wp-content/uploads/2024/02/AP_Winter_Vineyard.jpg" alt="Quiet off-season vines" className="rounded-xl shadow-lg object-cover h-64 w-full" />
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 print:break-before-page">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MapPin className="w-7 h-7 text-purple-600" />
            Your Route Map
          </h3>
          <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center print:hidden">
            <div className="text-center text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Interactive map coming soon</p>
              <p className="text-sm mt-2">Use the green button above for instant navigation!</p>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            className="w-full mt-8 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all print:hidden"
          >
            Plan Another Trail
          </button>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm print:mt-8">
          <p>Created by Valley Somm • Your AI Wine Trail Guide</p>
          <p className="mt-2">Discover Yadkin Valley, North Carolina</p>
          <p className="mt-2">© 2025 Yadkin Data Partners LLC. All rights reserved.</p>
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