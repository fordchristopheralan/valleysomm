// app/api/trails/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTrailById } from '@/lib/db/trails';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise (required in Next.js 16+)
    const { id } = await params;

    const trail = await getTrailById(id);

    if (!trail) {
      return NextResponse.json(
        { error: 'Trail not found' },
        { status: 404 }
      );
    }

    // Convert to AITrailResponse format
    const response = {
      trailName: trail.trailName,
      summary: trail.summary,
      totalStops: trail.stops,
      estimatedDurationHours: trail.estimatedDuration,
      wineries: trail.wineries,
      id: trail.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Trail fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trail' },
      { status: 500 }
    );
  }
}