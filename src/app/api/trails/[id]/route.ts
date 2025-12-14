import { NextResponse } from 'next/server';
import { getTrailById } from '@/lib/db/trails';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trail = await getTrailById(params.id);
    
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
      id: trail.id
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