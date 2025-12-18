import Link from "next/link";
import { Wine, MessageCircle, Map, Clock, Sparkles, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-burgundy rounded-full flex items-center justify-center">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-burgundy">Valley Somm</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/wineries"
              className="text-stone-600 hover:text-burgundy transition-colors hidden sm:block"
            >
              Browse Wineries
            </Link>
            <Link
              href="/chat"
              className="bg-burgundy text-white px-4 py-2 rounded-full font-medium hover:bg-wine transition-colors"
            >
              Start Planning
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-wine via-burgundy to-burgundy-700">
        <div className="max-w-4xl mx-auto text-center text-white pt-16 pb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Trip Planning</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Plan Your Perfect
            <br />
            <span className="text-gold">Yadkin Valley</span> Wine Trip
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            Tell our AI sommelier what you're looking for, and get personalized 
            winery recommendations in minutes — not hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 bg-gold text-wine px-8 py-4 rounded-full text-lg font-bold hover:bg-gold-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Valley Somm
            </Link>
            <Link
              href="/wineries"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Browse All Wineries
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-burgundy">50+</div>
            <div className="text-stone-600">Curated Wineries</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-burgundy">~10 min</div>
            <div className="text-stone-600">To Plan Your Trip</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-burgundy">100%</div>
            <div className="text-stone-600">Personalized</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-center text-stone-600 mb-12 max-w-2xl mx-auto">
            No more hours of research and spreadsheets. Just have a conversation.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-burgundy/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-burgundy" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Tell Us What You Want</h3>
              <p className="text-stone-600">
                Describe your ideal wine trip — who's coming, what you like, what 
                you're celebrating. Our AI understands natural conversation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-burgundy/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-burgundy" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Get Smart Recommendations</h3>
              <p className="text-stone-600">
                Valley Somm knows every winery in the region — their wines, vibes, 
                and hidden gems. Get matches that actually fit you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-burgundy/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-burgundy" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Build Your Itinerary</h3>
              <p className="text-stone-600">
                Save your favorites, get an optimized route, and share with your 
                group. Everything you need in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-burgundy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Discover Yadkin Valley?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Whether it's a romantic weekend, a girls' trip, or your first time 
            exploring wine country — Valley Somm has you covered.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-gold text-wine px-8 py-4 rounded-full text-lg font-bold hover:bg-gold-light transition-all shadow-lg"
          >
            <Wine className="w-5 h-5" />
            Start Planning for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5" />
            <span>Valley Somm</span>
          </div>
          <div className="text-sm">
            Your AI guide to Yadkin Valley wine country
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/wineries" className="hover:text-white transition-colors">
              Wineries
            </Link>
            <Link href="/chat" className="hover:text-white transition-colors">
              Plan a Trip
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
