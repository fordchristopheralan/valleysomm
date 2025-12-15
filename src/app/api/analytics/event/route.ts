// src/app/api/analytics/event/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';

    await db.query(`
      INSERT INTO analytics_events (
        event_type, 
        properties, 
        timestamp, 
        ip_address, 
        user_agent, 
        path
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `, [
      body.event_type,
      body.properties || {},
      body.timestamp || new Date().toISOString(),
      clientIp,
      body.user_agent || request.headers.get('user-agent') || 'unknown',
      new URL(body.url || request.url).pathname
    ]);

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Analytics insert failed:', err);
    return new Response('Error', { status: 500 });
  }
}