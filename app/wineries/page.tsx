import { sql } from "@/lib/db";
import Link from "next/link";
import { Wine, MapPin, Star, DollarSign, Filter } from "lucide-react";

interface Winery {
  id: string;
  name: string;
  slug: string;
  description: string;
  address_city: string;
  tasting_fee: string | null;
  google_rating: number | null;
  quality_score: number;
  wine_styles: string[];
  amenities: string[];
  vibe: string[];
}

async function getWineries() {
  const wineries = await sql`
    SELECT 
      id, name, slug, description, address_city,
      tasting_fee, google_rating, quality_score,
      wine_styles, amenities, vibe
    FROM wineries
    WHERE is_active = true
    ORDER BY quality_score DESC, google_rating DESC NULLS LAST
  ` as Winery[];

  return wineries;
}

export default async function WineriesPage() {
  const wineries = await getWineries();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-wine via-burgundy to-burgundy-600 text-white">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wine className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Valley Somm</span>
          </Link>
          <Link
            href="/chat"
            className="bg-gold text-wine px-4 py-2 rounded-full font-medium hover:bg-gold-light transition-colors"
          >
            Plan a Trip
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Yadkin Valley Wineries</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Explore all {wineries.length} wineries in North Carolina's premier
            wine region. Each one hand-picked and ready for your visit.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Filter Bar */}
        <div className="bg-white rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4 shadow-sm border border-stone-200">
          <span className="text-stone-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Quick filters:
          </span>
          <Link
            href="/chat?prompt=Show me wineries with scenic views"
            className="px-3 py-1.5 bg-stone-100 hover:bg-burgundy/10 rounded-full text-sm text-stone-600 hover:text-burgundy transition-colors"
          >
            Scenic views
          </Link>
          <Link
            href="/chat?prompt=Which wineries have food available?"
            className="px-3 py-1.5 bg-stone-100 hover:bg-burgundy/10 rounded-full text-sm text-stone-600 hover:text-burgundy transition-colors"
          >
            Food available
          </Link>
          <Link
            href="/chat?prompt=Best wineries for dry red wines"
            className="px-3 py-1.5 bg-stone-100 hover:bg-burgundy/10 rounded-full text-sm text-stone-600 hover:text-burgundy transition-colors"
          >
            Dry reds
          </Link>
          <Link
            href="/chat?prompt=Pet-friendly wineries"
            className="px-3 py-1.5 bg-stone-100 hover:bg-burgundy/10 rounded-full text-sm text-stone-600 hover:text-burgundy transition-colors"
          >
            Pet-friendly
          </Link>
        </div>

        {/* Winery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wineries.map((winery) => (
            <Link
              key={winery.id}
              href={`/wineries/${winery.slug}`}
              className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-burgundy via-wine to-amber-900 flex items-center justify-center group-hover:from-wine group-hover:to-burgundy transition-colors">
                <Wine className="w-12 h-12 text-white/80" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-stone-900 group-hover:text-burgundy transition-colors">
                    {winery.name}
                  </h3>
                  {winery.google_rating && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {winery.google_rating}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-stone-500 mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {winery.address_city}
                  {winery.tasting_fee && (
                    <>
                      <span className="mx-1">•</span>
                      <DollarSign className="w-3 h-3" />
                      {winery.tasting_fee}
                    </>
                  )}
                </p>

                <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                  {winery.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {winery.vibe?.slice(0, 2).map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 bg-burgundy/10 text-burgundy rounded-full text-xs"
                    >
                      {v}
                    </span>
                  ))}
                  {winery.wine_styles?.slice(0, 1).map((ws) => (
                    <span
                      key={ws}
                      className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs"
                    >
                      {ws.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-burgundy text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Not sure where to start?
          </h2>
          <p className="text-white/80 mb-6">
            Let our AI sommelier help you find the perfect wineries for your
            trip.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-gold text-wine px-6 py-3 rounded-full font-bold hover:bg-gold-light transition-colors"
          >
            <Wine className="w-5 h-5" />
            Chat with Valley Somm
          </Link>
        </div>
      </main>
    </div>
  );
}
