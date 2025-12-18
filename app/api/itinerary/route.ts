import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateShareToken } from "@/lib/utils";

// POST - Create a new itinerary
export async function POST(req: NextRequest) {
  try {
    const { sessionId, wineryIds, title } = await req.json();

    if (!wineryIds || wineryIds.length === 0) {
      return NextResponse.json(
        { error: "At least one winery required" },
        { status: 400 }
      );
    }

    // Generate unique share token
    const shareToken = generateShareToken();

    // Build wineries JSONB
    const wineriesData = wineryIds.map((id: string, index: number) => ({
      winery_id: id,
      day: Math.floor(index / 4) + 1, // ~4 wineries per day
      order: (index % 4) + 1,
      suggested_time: getSuggestedTime(index % 4),
    }));

    // Create itinerary
    const result = await sql`
      INSERT INTO itineraries (session_id, share_token, title, wineries)
      VALUES (
        ${sessionId ? sessionId : null}::uuid,
        ${shareToken},
        ${title || "My Yadkin Valley Trip"},
        ${JSON.stringify(wineriesData)}::jsonb
      )
      RETURNING id, share_token
    `;

    // Track event
    if (sessionId) {
      await sql`
        INSERT INTO events (session_id, event_type, properties)
        VALUES (
          ${sessionId}::uuid,
          'itinerary_created',
          ${JSON.stringify({
            itinerary_id: result[0].id,
            winery_count: wineryIds.length,
          })}::jsonb
        )
      `;
    }

    return NextResponse.json({
      id: result[0].id,
      shareToken: result[0].share_token,
    });
  } catch (error) {
    console.error("Failed to create itinerary:", error);
    return NextResponse.json(
      { error: "Failed to create itinerary" },
      { status: 500 }
    );
  }
}

// Helper to get suggested time slot
function getSuggestedTime(orderInDay: number): string {
  const times = ["10:00 AM", "12:00 PM", "2:30 PM", "4:30 PM"];
  return times[orderInDay] || "3:00 PM";
}
