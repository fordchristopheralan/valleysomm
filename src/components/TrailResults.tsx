'use client';

import React, { useState } from 'react';
import { Wine, Clock, MapPin, Share2, Sparkles, ExternalLink, ChevronLeft } from 'lucide-react';
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
    const url = window.location.href;
    const text = `Check out my ${trail.trailName} wine trail in Yadkin Valley!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: trail.trailName, text, url });
      } catch (err) {
        // User cancelled or share failed
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  Your Custom Trail
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
                <p className="text-xl font-bold text-gray-900">~{trail.estimatedDurationHours} hours</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 print:hidden">
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

        {/* Wineries List */}
        <div className="space-y-4">
          {trail.wineries.map((stop, idx) => {
            const winery = getWineryById(stop.wineryId);
            if (!winery) {
              console.error(`Winery not found: ${stop.wineryId}`);
              return null;
            }

            return (
              <div 
                key={stop.wineryId} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl print:shadow-none print:break-inside-avoid"
              >
                <div className="p-6">
                  {/* Header with Order Number */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0">
                      {stop.order}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {winery.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Arrive around {stop.suggestedArrivalTime}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">{winery.description}</p>

                  {/* Why Included - Highlighted */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-purple-900 mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Why we picked this for you:
                    </p>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {stop.whyItsIncluded}
                    </p>
                  </div>

                  {/* What to Try */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      🍷 What to try:
                    </p>
                    <p className="text-sm text-gray-700">{stop.whatToTry}</p>
                  </div>

                  {/* Tags and Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {winery.vibeTags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {winery.scenic && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Scenic views
                      </span>
                    )}
                    {winery.lunchNearby && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
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
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors print:hidden"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-before-page">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Your Route Map
          </h3>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Interactive map coming soon</p>
              <p className="text-sm mt-1">Use your favorite maps app to navigate between stops</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 print:break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            💡 Tips for Your Wine Trail
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Start early (around 11 AM) to enjoy the full experience without rushing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Designate a driver or consider hiring a wine tour service</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Call ahead to confirm hours and availability, especially for groups</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Bring a cooler if you plan to purchase bottles along the way</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>Stay hydrated and have snacks between stops</span>
            </li>
          </ul>
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
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:break-before-page {
            break-before: page;
          }
        }
      `}</style>
    </div>
  );
}