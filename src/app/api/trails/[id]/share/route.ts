import { NextResponse } from 'next/server';
import { incrementShareCount } from '@/lib/db/trails';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await incrementShareCount(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share tracking failed:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}