'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Questionnaire from '@/components/Questionnaire';
import type { AIInput } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuestionnaireComplete = async (data: AIInput) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to generate trail');
      }

      const trail = await response.json();
      const trailId = Date.now().toString();
      
      // Save to localStorage
      localStorage.setItem(`trail_${trailId}`, JSON.stringify(trail));
      
      // Navigate to results
      router.push(`/trail/${trailId}`);
    } catch (error) {
      console.error('Error generating trail:', error);
      alert('Sorry, something went wrong. Please try again.');
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Crafting Your Perfect Wine Trail
          </h2>
          <p className="text-white/80 text-lg">
            Analyzing preferences and matching wineries...
          </p>
        </div>
      </div>
    );
  }

  if (showQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4 py-8">
        <Questionnaire 
          onComplete={handleQuestionnaireComplete}
          onCancel={() => setShowQuestionnaire(false)}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Questionnaire CTA */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="Rolling vineyards of Yadkin Valley"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-pink-900/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Valley Somm
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-8 drop-shadow-lg">
            Your AI Sommelier for Yadkin Valley
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Answer 5 quick questions and get a personalized wine trail tailored to your taste, schedule, and travel preferences.
          </p>
          
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="bg-white text-purple-600 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl"
          >
            Build My Wine Trail →
          </button>

          <p className="text-white/60 text-sm mt-6">
            Takes less than 2 minutes • No signup required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Share Your Preferences
              </h3>
              <p className="text-gray-600 text-lg">
                Tell us about your wine taste, group size, and what kind of vibe you're looking for.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI Creates Your Trail
              </h3>
              <p className="text-gray-600 text-lg">
                Our AI matches you with the perfect wineries, optimized for driving time and your preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Enjoy Your Day
              </h3>
              <p className="text-gray-600 text-lg">
                Follow your personalized route with confidence, knowing each stop is perfect for you.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-purple-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI-Powered Matching
              </h3>
              <p className="text-gray-600">
                Personalized recommendations based on your unique preferences and constraints.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Optimized Routes
              </h3>
              <p className="text-gray-600">
                Minimize driving time and maximize wine tasting with smart route planning.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Instant Results
              </h3>
              <p className="text-gray-600">
                Get your custom trail in seconds. Share it, save it, or print it for your trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Explore Yadkin Valley?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Create your personalized wine trail in under 2 minutes
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="bg-white text-purple-600 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl"
          >
            Build My Wine Trail →
          </button>
          <p className="text-white/60 text-sm mt-6">
            No signup • No credit card • 100% free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Valley Somm. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Discover Yadkin Valley, North Carolina
          </p>
        </div>
      </footer>
    </main>
  );
}