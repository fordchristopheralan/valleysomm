// app/api/trails/[id]/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { incrementViewCount } from '@/lib/db/trails';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise (required in Next.js 16+)
    const { id } = await params;

    const metadata = {
      referrer: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        undefined,
    };

    await incrementViewCount(id, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View tracking failed:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}