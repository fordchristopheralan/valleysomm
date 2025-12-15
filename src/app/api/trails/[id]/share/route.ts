// app/api/trails/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { incrementShareCount } from '@/lib/db/trails';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the actual id
    const { id } = await params;

    await incrementShareCount(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share tracking failed:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}