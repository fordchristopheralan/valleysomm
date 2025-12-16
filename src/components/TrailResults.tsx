// This is a PARTIAL enhanced trail display component
// It shows the key additions for multi-day support
// You'll need to merge this with your existing TrailResults.tsx

'use client';

import React, { useState } from 'react';
import {
  Wine,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Utensils,
  Hotel,
  Navigation,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AITrailResponse, DayItinerary, WeatherInfo } from '@/lib/types';

type TrailResultsProps = {
  trail: AITrailResponse;
  onReset?: () => void;
};

// Weather icon component
function WeatherIcon({ conditions }: { conditions: string }) {
  const lower = conditions.toLowerCase();
  if (lower.includes('rain')) return <CloudRain className="w-6 h-6" />;
  if (lower.includes('cloud')) return <Cloud className="w-6 h-6" />;
  return <Sun className="w-6 h-6" />;
}

// Weather card component
function WeatherCard({ weather }: { weather?: WeatherInfo }) {
  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
      <div className="flex items-center gap-3">
        <div className="text-blue-600">
          <WeatherIcon conditions={weather.conditions} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{weather.avgTemp}°F</p>
          <p className="text-sm text-gray-600">{weather.conditions}</p>
        </div>
        {weather.precipitation > 30 && (
          <div className="ml-auto text-right">
            <p className="text-sm text-blue-600 font-medium">
              {weather.precipitation}% rain
            </p>
          </div>
        )}
      </div>
      {weather.historicalNote && (
        <p className="text-sm text-gray-600 mt-2 italic">
          {weather.historicalNote}
        </p>
      )}
    </div>
  );
}

// Day itinerary card for multi-day trips
function DayItineraryCard({ 
  dayItinerary, 
  dayNumber 
}: { 
  dayItinerary: DayItinerary; 
  dayNumber: number;
}) {
  const [expanded, setExpanded] = useState(dayNumber === 1); // First day expanded by default

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
              {dayItinerary.date && (
                <p className="text-sm text-purple-200 mt-1">
                  {new Date(dayItinerary.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
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
          {dayItinerary.stops.map((stop, idx) => (
            <div key={stop.wineryId} className="border-l-4 border-purple-300 pl-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-purple-600">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {/* You'll need to look up winery name by ID */}
                      Stop {idx + 1}
                    </h4>
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
                </div>
              </div>
            </div>
          ))}

          {/* Recommendations */}
          {dayItinerary.recommendations && (
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

export default function EnhancedTrailResults({ trail, onReset }: TrailResultsProps) {
  const [saved, setSaved] = useState(false);

  // Detect if multi-day
  const isMultiDay = trail.isMultiDay && trail.dailyItineraries;

  const handleShare = async () => {
    // Your existing share logic
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
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
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

          {/* Weather Card */}
          {trail.weatherForecast && (
            <div className="mt-6">
              <WeatherCard weather={trail.weatherForecast} />
            </div>
          )}

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
            {trail.bestTimeToVisit && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Best Time</p>
                  <p className="text-sm font-medium text-gray-900">{trail.bestTimeToVisit}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleShare}
              className="flex-1 min-w-[200px] py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {saved ? '✓ Link Copied!' : 'Share Trail'}
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
        ) : (
          <div className="space-y-6">
            {/* Your existing single-day winery display */}
            {trail.wineries?.map((stop, idx) => (
              <div key={stop.wineryId} className="bg-white rounded-2xl shadow-xl p-6">
                <h3>Winery Stop {idx + 1}</h3>
                {/* ... your existing winery card content */}
              </div>
            ))}
          </div>
        )}

        {/* Packing List */}
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