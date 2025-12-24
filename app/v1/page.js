'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'

export default function V1Page() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Wine glass icon */}
        <div className="flex justify-center mb-6">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="#6B2D3F" strokeWidth="2" fill="none"/>
            <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M40 68V76" stroke="#6B2D3F" strokeWidth="2"/>
            <path d="M32 76H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold text-center mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2C2C30' }}>
          Plan Your Yadkin Valley Wine Adventure
        </h1>
        
        {/* Tagline */}
        <p className="text-xl text-center text-stone-600 mb-8">
          Chat. Plan. Taste. Your AI sommelier for North Carolina wine country.
        </p>

        {/* CTA Button */}
        {!showChat && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowChat(true)}
              className="px-8 py-4 bg-gradient-to-r from-wine-deep to-wine-burgundy text-white text-lg font-semibold rounded-full hover:shadow-lg transition-all"
              style={{ 
                '--wine-deep': '#6B2D3F',
                '--wine-burgundy': '#8B3A4D',
                background: 'linear-gradient(135deg, #6B2D3F 0%, #8B3A4D 100%)'
              }}
            >
              Start Planning Your Trip
            </button>
          </div>
        )}

        {/* How It Works */}
        {!showChat && (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#6B2D3F' }}>Chat with AI</h3>
              <p className="text-stone-600 text-sm">Tell us your preferences in a casual conversation</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#6B2D3F' }}>Get Your Route</h3>
              <p className="text-stone-600 text-sm">Receive a personalized itinerary with wineries matched to your taste</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🍷</div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#6B2D3F' }}>Visit & Enjoy</h3>
              <p className="text-stone-600 text-sm">Book reservations and experience Yadkin Valley's best</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] relative flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M14 2L2 14" stroke="#4A4A50" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Chat Interface */}
            <ChatInterface />
          </div>
        </div>
      )}
    </div>
  )
}