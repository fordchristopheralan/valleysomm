import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const style = searchParams.get("style");
    const amenity = searchParams.get("amenity");
    const vibe = searchParams.get("vibe");

    let query = sql`
      SELECT 
        id, name, slug, description, address_city,
        tasting_fee, google_rating, quality_score,
        wine_styles, amenities, vibe, best_for
      FROM wineries
      WHERE is_active = true
    `;

    // For now, return all and filter client-side
    // In production, you'd build dynamic WHERE clauses
    const wineries = await sql`
      SELECT 
        id, name, slug, description, address_city,
        tasting_fee, google_rating, quality_score,
        wine_styles, amenities, vibe, best_for
      FROM wineries
      WHERE is_active = true
      ORDER BY quality_score DESC, google_rating DESC NULLS LAST
    `;

    return NextResponse.json({ wineries });
  } catch (error) {
    console.error("Failed to fetch wineries:", error);
    return NextResponse.json(
      { error: "Failed to fetch wineries" },
      { status: 500 }
    );
  }
}
