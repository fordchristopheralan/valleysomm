import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Test connection
    const time = await sql`SELECT NOW() as current_time`;
    
    // Test tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // Count trails
    const count = await sql`SELECT COUNT(*) as count FROM trails`;
    
    return NextResponse.json({
      status: 'connected',
      currentTime: time[0].current_time,
      tables: tables.map(t => t.table_name),
      trailCount: parseInt(count[0].count),
      message: 'Database connection successful!'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed'
    }, { status: 500 });
  }
}