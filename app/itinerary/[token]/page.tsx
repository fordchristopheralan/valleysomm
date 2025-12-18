import { sql } from "@/lib/db";
import Link from "next/link";
import {
  Wine,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Phone,
  Globe,
  Share2,
  ChevronRight,
  Car,
} from "lucide-react";
import { notFound } from "next/navigation";

interface ItineraryWinery {
  winery_id: string;
  day: number;
  order: number;
  suggested_time: string;
}

interface Winery {
  id: string;
  name: string;
  slug: string;
  description: string;
  engaging_description: string;
  address_street: string;
  address_city: string;
  phone: string | null;
  website: string | null;
  tasting_fee: string | null;
  google_rating: number | null;
  wine_styles: string[];
  varietals: string[];
  amenities: string[];
  vibe: string[];
}

async function getItinerary(token: string) {
  const result = await sql`
    SELECT id, title, wineries, narrative, created_at
    FROM itineraries
    WHERE share_token = ${token}
  `;

  if (result.length === 0) {
    return null;
  }

  const itinerary = result[0];
  const wineryIds = (itinerary.wineries as ItineraryWinery[]).map(
    (w) => w.winery_id
  );

  // Get full winery details
  const wineries = await sql`
    SELECT 
      id, name, slug, description, engaging_description,
      address_street, address_city, phone, website,
      tasting_fee, google_rating, wine_styles, varietals, amenities, vibe
    FROM wineries
    WHERE id = ANY(${wineryIds}::uuid[])
  ` as Winery[];

  // Map wineries to itinerary order
  const wineryMap = new Map(wineries.map((w) => [w.id, w]));
  const orderedWineries = (itinerary.wineries as ItineraryWinery[]).map(
    (iw) => ({
      ...iw,
      winery: wineryMap.get(iw.winery_id),
    })
  );

  // Group by day
  const days: Map<number, typeof orderedWineries> = new Map();
  orderedWineries.forEach((w) => {
    if (!days.has(w.day)) {
      days.set(w.day, []);
    }
    days.get(w.day)!.push(w);
  });

  return {
    ...itinerary,
    days: Array.from(days.entries())
      .sort(([a], [b]) => a - b)
      .map(([day, stops]) => ({
        day,
        stops: stops.sort((a, b) => a.order - b.order),
      })),
    totalWineries: orderedWineries.length,
  };
}

export default async function ItineraryPage({
  params,
}: {
  params: { token: string };
}) {
  const itinerary = await getItinerary(params.token);

  if (!itinerary) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/itinerary/${params.token}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-wine via-burgundy to-burgundy-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Wine className="w-6 h-6" />
            <span className="font-bold">Valley Somm</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {itinerary.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <span className="flex items-center gap-1">
              <Wine className="w-4 h-4" />
              {itinerary.totalWineries} wineries
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {itinerary.days.length} day{itinerary.days.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Share Banner */}
        <div className="bg-white rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm border border-stone-200">
          <div>
            <p className="font-medium text-stone-900">Share this itinerary</p>
            <p className="text-sm text-stone-500">
              Send this link to your travel companions
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl);
              }
            }}
            className="flex items-center gap-2 bg-burgundy text-white px-4 py-2 rounded-lg hover:bg-wine transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Copy Link
          </button>
        </div>

        {/* Narrative (if generated) */}
        {itinerary.narrative && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-stone-200">
            <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
              {itinerary.narrative}
            </p>
          </div>
        )}

        {/* Days */}
        {itinerary.days.map(({ day, stops }) => (
          <div key={day} className="mb-8">
            <h2 className="text-2xl font-bold text-burgundy mb-4 flex items-center gap-2">
              Day {day}
              <span className="text-base font-normal text-stone-500">
                ({stops.length} wineries)
              </span>
            </h2>

            <div className="space-y-4">
              {stops.map((stop, index) => (
                <div key={stop.winery_id}>
                  {/* Winery Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-7 h-7 bg-burgundy text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {stop.order}
                            </span>
                            <span className="text-sm text-burgundy font-medium">
                              {stop.suggested_time}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-stone-900">
                            {stop.winery?.name}
                          </h3>
                          <p className="text-stone-500 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {stop.winery?.address_street},{" "}
                            {stop.winery?.address_city}
                          </p>
                        </div>
                        {stop.winery?.google_rating && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">
                              {stop.winery.google_rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-stone-600 mb-4">
                        {stop.winery?.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {stop.winery?.vibe?.map((v) => (
                          <span
                            key={v}
                            className="px-2 py-1 bg-burgundy/10 text-burgundy rounded-full text-xs"
                          >
                            {v}
                          </span>
                        ))}
                        {stop.winery?.amenities?.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs"
                          >
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
                        {stop.winery?.tasting_fee && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {stop.winery.tasting_fee}
                          </span>
                        )}
                        {stop.winery?.phone && (
                          <a
                            href={`tel:${stop.winery.phone}`}
                            className="flex items-center gap-1 hover:text-burgundy"
                          >
                            <Phone className="w-4 h-4" />
                            {stop.winery.phone}
                          </a>
                        )}
                        {stop.winery?.website && (
                          <a
                            href={`https://${stop.winery.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-burgundy"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Drive time indicator (between wineries) */}
                  {index < stops.length - 1 && (
                    <div className="flex items-center justify-center py-3 text-stone-400">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4" />
                        <span>~15-20 min drive</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Plan Another Trip CTA */}
        <div className="bg-burgundy text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Want to customize this trip?</h3>
          <p className="text-white/80 mb-6">
            Chat with Valley Somm to add more wineries or get different
            recommendations.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-gold text-wine px-6 py-3 rounded-full font-bold hover:bg-gold-light transition-colors"
          >
            <Wine className="w-5 h-5" />
            Start New Conversation
          </Link>
        </div>
      </main>
    </div>
  );
}
