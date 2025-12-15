// app/api/analytics/event/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db'; // your Neon/Postgres client

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await db.query(`
      INSERT INTO analytics_events (
        event_type, properties, timestamp, ip_address, user_agent, path
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `, [
      body.event_type,
      body.properties,
      body.timestamp || new Date().toISOString(),
      request.ip || 'unknown',
      body.user_agent || request.headers.get('user-agent'),
      new URL(body.url || request.url).pathname
    ]);

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Analytics insert failed:', err);
    return new Response('Error', { status: 500 });
  }
}