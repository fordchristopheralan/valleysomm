import { sql } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Wine,
  MapPin,
  Star,
  DollarSign,
  Phone,
  Globe,
  Clock,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";

interface Winery {
  id: string;
  name: string;
  slug: string;
  description: string;
  engaging_description: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  reservation_required: string;
  tasting_fee: string | null;
  google_rating: number | null;
  google_review_count: string | null;
  quality_score: number;
  wine_styles: string[];
  varietals: string[];
  amenities: string[];
  vibe: string[];
  best_for: string[];
}

async function getWinery(slug: string) {
  const result = await sql`
    SELECT *
    FROM wineries
    WHERE slug = ${slug} AND is_active = true
  ` as Winery[];

  return result[0] || null;
}

export default async function WineryPage({
  params,
}: {
  params: { slug: string };
}) {
  const winery = await getWinery(params.slug);

  if (!winery) {
    notFound();
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${winery.name} ${winery.address_street} ${winery.address_city} NC`
  )}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-wine via-burgundy to-burgundy-600 text-white">
        <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
      </header>

      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link
          href="/wineries"
          className="inline-flex items-center gap-1 text-stone-500 hover:text-burgundy transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all wineries
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Hero Image Placeholder */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-burgundy via-wine to-amber-900 rounded-xl flex items-center justify-center mb-8">
          <Wine className="w-20 h-20 text-white/80" />
        </div>

        {/* Winery Info */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
                {winery.name}
              </h1>
              {winery.google_rating && (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold">{winery.google_rating}</span>
                  {winery.google_review_count && (
                    <span className="text-stone-500 text-sm ml-1">
                      ({winery.google_review_count})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {winery.vibe?.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-medium"
                >
                  {v}
                </span>
              ))}
              {winery.wine_styles?.map((ws) => (
                <span
                  key={ws}
                  className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm"
                >
                  {ws.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="prose prose-stone max-w-none mb-8">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {winery.engaging_description || winery.description}
              </p>
            </div>

            {/* Varietals */}
            {winery.varietals && winery.varietals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">Featured Wines</h2>
                <div className="flex flex-wrap gap-2">
                  {winery.varietals.map((v) => (
                    <span
                      key={v}
                      className="px-3 py-1.5 bg-burgundy text-white rounded-full text-sm"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {winery.amenities && winery.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {winery.amenities.map((a) => (
                    <span
                      key={a}
                      className="px-3 py-1.5 bg-sage/20 text-sage rounded-full text-sm capitalize"
                    >
                      {a.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Best For */}
            {winery.best_for && winery.best_for.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">Best For</h2>
                <div className="flex flex-wrap gap-2">
                  {winery.best_for.map((bf) => (
                    <span
                      key={bf}
                      className="px-3 py-1.5 bg-gold/20 text-amber-800 rounded-full text-sm capitalize"
                    >
                      {bf.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Visit Details</h3>

              <div className="space-y-4">
                {/* Tasting Fee */}
                {winery.tasting_fee && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Tasting Fee</p>
                      <p className="text-stone-600">{winery.tasting_fee}</p>
                    </div>
                  </div>
                )}

                {/* Reservations */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Reservations</p>
                    <p className="text-stone-600 capitalize">
                      {winery.reservation_required || "Not required"}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-stone-600">
                      {winery.address_street}
                      <br />
                      {winery.address_city}, NC {winery.address_zip}
                    </p>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-burgundy hover:underline text-sm mt-1 inline-block"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>

                {/* Phone */}
                {winery.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href={`tel:${winery.phone}`}
                        className="text-burgundy hover:underline"
                      >
                        {winery.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {winery.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={`https://${winery.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-burgundy hover:underline"
                      >
                        {winery.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6 pt-6 border-t border-stone-200">
                <Link
                  href={`/chat?prompt=Tell me more about ${encodeURIComponent(
                    winery.name
                  )}`}
                  className="w-full bg-burgundy text-white py-3 rounded-lg font-medium hover:bg-wine transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Valley Somm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
