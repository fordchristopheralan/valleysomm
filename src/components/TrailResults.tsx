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
  ChevronDown,
  ChevronUp,
  Utensils,
  Hotel,
  Calendar,
} from 'lucide-react';
import type { AITrailResponse, DayItinerary } from '@/lib/types';
import { getWineryById } from '@/lib/wineries';

type TrailResultsProps = {
  trail: AITrailResponse;
  onReset?: () => void;
};

// Day itinerary card for multi-day trips
function DayItineraryCard({ 
  dayItinerary, 
  dayNumber 
}: { 
  dayItinerary: DayItinerary; 
  dayNumber: number;
}) {
  const [expanded, setExpanded] = useState(dayNumber === 1);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100">
      {/* Day Header */}
      <div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">{dayNumber}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Day {dayNumber}</h3>
              <p className="text-purple-100">{dayItinerary.theme}</p>
            </div>
          </div>
          <div className="text-white">
            {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-white/90 text-sm">
          <span>⏱️ {dayItinerary.estimatedDuration}</span>
          <span>🍷 {dayItinerary.stops.length} wineries</span>
        </div>
      </div>

      {/* Day Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Stops */}
          {dayItinerary.stops.map((stop, idx) => {
            const winery = getWineryById(stop.wineryId);
            if (!winery) return null;

            return (
              <div key={stop.wineryId} className="border-l-4 border-purple-300 pl-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-purple-600">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-lg">{winery.name}</h4>
                      <span className="text-sm font-medium text-purple-600">
                        {stop.suggestedArrivalTime}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">{stop.whyItsIncluded}</p>
                    <div className="mt-3 bg-purple-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-900">
                        🍷 Try: {stop.whatToTry}
                      </p>
                    </div>
                    {winery.website && (
                      <a
                        href={winery.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Recommendations */}
          {(dayItinerary.recommendations.lunch || dayItinerary.recommendations.dinner || dayItinerary.recommendations.accommodation) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Day {dayNumber} Recommendations
              </h4>
              
              {dayItinerary.recommendations.lunch && (
                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Lunch</p>
                    <p className="text-gray-700">{dayItinerary.recommendations.lunch}</p>
                  </div>
                </div>
              )}
              
              {dayItinerary.recommendations.dinner && (
                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Dinner</p>
                    <p className="text-gray-700">{dayItinerary.recommendations.dinner}</p>
                  </div>
                </div>
              )}
              
              {dayItinerary.recommendations.accommodation && (
                <div className="flex items-start gap-3">
                  <Hotel className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Where to Stay</p>
                    <p className="text-gray-700">{dayItinerary.recommendations.accommodation}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrailResults({ trail, onReset }: TrailResultsProps) {
  const [saved, setSaved] = useState(false);

  // Determine if multi-day
  const isMultiDay = trail.isMultiDay && trail.dailyItineraries && trail.dailyItineraries.length > 0;

  // Critical guard for SSR safety
  if (!trail || (!trail.wineries && !trail.dailyItineraries)) {
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

  // Build Google Maps link (works for both single and multi-day)
  const buildGoogleMapsLink = () => {
    let allWineries: { latitude: number; longitude: number }[] = [];

    if (isMultiDay && trail.dailyItineraries) {
      // Collect all wineries from all days
      trail.dailyItineraries.forEach(day => {
        day.stops.forEach(stop => {
          const winery = getWineryById(stop.wineryId);
          if (winery) allWineries.push(winery);
        });
      });
    } else if (trail.wineries) {
      // Single day
      allWineries = trail.wineries
        .map((stop) => getWineryById(stop.wineryId))
        .filter(Boolean) as { latitude: number; longitude: number }[];
    }

    if (allWineries.length < 2) return null;

    const intermediates = allWineries.slice(0, -1);
    const destination = allWineries[allWineries.length - 1];

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
                  {isMultiDay ? `YOUR ${trail.numberOfDays}-DAY EXPERIENCE` : 'YOUR CUSTOM TRAIL'}
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
                  {isMultiDay 
                    ? `${trail.numberOfDays} days` 
                    : `~${trail.estimatedDurationHours} hours`
                  }
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

        {/* Multi-Day Itineraries OR Single-Day Wineries */}
        {isMultiDay && trail.dailyItineraries ? (
          <div className="space-y-6">
            {trail.dailyItineraries.map((dayItinerary, idx) => (
              <DayItineraryCard
                key={idx}
                dayItinerary={dayItinerary}
                dayNumber={idx + 1}
              />
            ))}
          </div>
        ) : trail.wineries ? (
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
                  {/* Stop Number Badge */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{winery.name}</h2>
                        <p className="text-purple-100 font-medium">{stop.suggestedArrivalTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Why Included */}
                    <div className="mb-6">
                      <p className="font-semibold text-gray-900 mb-2">Why this stop:</p>
                      <p className="text-gray-700">{stop.whyItsIncluded}</p>
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
        ) : null}

        {/* Packing List (if present) */}
        {trail.packingList && trail.packingList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎒 What to Bring
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {trail.packingList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}