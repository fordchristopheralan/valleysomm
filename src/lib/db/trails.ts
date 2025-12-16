import { neon } from '@neondatabase/serverless';
import type { AIInput, AITrailResponse } from '@/lib/types';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

export type StoredTrail = {
  id: string;
  createdAt: Date;
  vibe: string;
  winePreferences: string[];
  groupType: string;
  stops: number;
  originCity: string;
  
  // Enhanced questionnaire fields
  visitDateStart?: string;
  visitDateEnd?: string;
  occasion?: string;
  specialRequests?: string;
  
  trailName: string;
  summary: string;
  estimatedDuration: number;
  wineries: any[];
  viewCount: number;
  sharedCount: number;
  lastViewedAt?: Date;
};

// Generate unique trail ID
function generateTrailId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Save trail to database
export async function saveTrail(
  input: AIInput,
  trail: Omit<AITrailResponse, 'id'>,  // ← Remove 'id' requirement
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<string> {
  const id = generateTrailId();
  
  try {
    await sql`
      INSERT INTO trails (
        id, vibe, wine_preferences, group_type, stops, origin_city,
        visit_date_start, visit_date_end, occasion, special_requests,
        trail_name, summary, estimated_duration,
        wineries, user_agent, ip_address
      ) VALUES (
        ${id},
        ${input.vibe},
        ${input.winePreferences},
        ${input.groupType},
        ${input.stops},
        ${input.originCity},
        ${input.visitDateStart || null},
        ${input.visitDateEnd || null},
        ${input.occasion || null},
        ${input.specialRequests || null},
        ${trail.trailName},
        ${trail.summary},
        ${trail.estimatedDurationHours},
        ${JSON.stringify(trail.wineries)},
        ${metadata?.userAgent || null},
        ${metadata?.ipAddress || null}
      )
    `;
    
    return id;
  } catch (error) {
    console.error('Failed to save trail:', error);
    throw new Error('Database save failed');
  }
}

// Get trail by ID
export async function getTrailById(id: string): Promise<StoredTrail | null> {
  try {
    const result = await sql`
      SELECT 
        id,
        created_at as "createdAt",
        vibe,
        wine_preferences as "winePreferences",
        group_type as "groupType",
        stops,
        origin_city as "originCity",
        visit_date_start as "visitDateStart",
        visit_date_end as "visitDateEnd",
        occasion,
        special_requests as "specialRequests",
        trail_name as "trailName",
        summary,
        estimated_duration as "estimatedDuration",
        wineries,
        view_count as "viewCount",
        shared_count as "sharedCount",
        last_viewed_at as "lastViewedAt"
      FROM trails
      WHERE id = ${id}
    `;
    
    if (result.length === 0) return null;
    
    const row = result[0];

    return {
      id: row.id,
      createdAt: row.createdAt,
      vibe: row.vibe,
      winePreferences: row.winePreferences,
      groupType: row.groupType,
      stops: row.stops,
      originCity: row.originCity,
      visitDateStart: row.visitDateStart ?? undefined,
      visitDateEnd: row.visitDateEnd ?? undefined,
      occasion: row.occasion ?? undefined,
      specialRequests: row.specialRequests ?? undefined,
      trailName: row.trailName,
      summary: row.summary,
      estimatedDuration: row.estimatedDuration,
      wineries: typeof row.wineries === 'string' 
        ? JSON.parse(row.wineries) 
        : row.wineries,
      viewCount: row.viewCount,
      sharedCount: row.sharedCount,
      lastViewedAt: row.lastViewedAt ?? undefined,
    };
  } catch (error) {
    console.error('Failed to get trail:', error);
    return null;
  }
}
// Increment view count
export async function incrementViewCount(
  id: string,
  metadata?: { referrer?: string; userAgent?: string; ipAddress?: string }
): Promise<void> {
  try {
    // Update view count
    await sql`
      UPDATE trails 
      SET 
        view_count = view_count + 1,
        last_viewed_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    // Log detailed view
    await sql`
      INSERT INTO trail_views (trail_id, referrer, user_agent, ip_address)
      VALUES (
        ${id},
        ${metadata?.referrer || null},
        ${metadata?.userAgent || null},
        ${metadata?.ipAddress || null}
      )
    `;
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
}

// Increment share count
export async function incrementShareCount(id: string): Promise<void> {
  try {
    await sql`
      UPDATE trails 
      SET 
        shared_count = shared_count + 1,
        was_shared = TRUE
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Failed to increment share count:', error);
  }
}

// Save feedback
export async function saveTrailFeedback(
  trailId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO trail_feedback (trail_id, rating, feedback)
      VALUES (${trailId}, ${rating}, ${feedback || null})
    `;
  } catch (error) {
    console.error('Failed to save feedback:', error);
    throw new Error('Feedback save failed');
  }
}

// Analytics queries
export async function getTrailAnalytics(days: number = 30) {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_trails,
        AVG(view_count) as avg_views,
        SUM(CASE WHEN was_shared THEN 1 ELSE 0 END) as shared_trails,
        AVG(stops) as avg_stops
      FROM trails
      WHERE created_at > NOW() - INTERVAL '${days} days'
    `;
    
    return result[0];
  } catch (error) {
    console.error('Analytics query failed:', error);
    return null;
  }
}

// Get popular trails
export async function getPopularTrails(limit: number = 10): Promise<StoredTrail[]> {
  try {
    const result = await sql`
      SELECT 
        id, trail_name as "trailName", view_count as "viewCount",
        shared_count as "sharedCount", vibe, origin_city as "originCity"
      FROM trails
      ORDER BY view_count DESC
      LIMIT ${limit}
    `;
    
    return result as any[];
  } catch (error) {
    console.error('Oops! Failed to get popular trails:', error);
    return [];
  }
}