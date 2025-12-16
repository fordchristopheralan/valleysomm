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
  specialRequests?: string;
  occasion?: string;
  trailName: string;
  summary: string;
  estimatedDuration: number;
  wineries: any[];
  viewCount: number;
  sharedCount: number;
  lastViewedAt?: Date;
  // Multi-day fields
  isMultiDay?: boolean;
  numberOfDays?: number;
  dailyItineraries?: any[];
  visitDateStart?: string;
  visitDateEnd?: string;
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

// Save trail to database (handles both single-day and multi-day)
export async function saveTrail(
  input: AIInput,
  trail: Omit<AITrailResponse, 'id'>,
  metadata?: { userAgent?: string; ipAddress?: string }
): Promise<string> {
  const id = generateTrailId();
  
  try {
    // Determine if multi-day
    const isMultiDay = trail.isMultiDay && trail.dailyItineraries && trail.dailyItineraries.length > 0;
    
    // For analytics: extract wineries from either format
    let wineriesForAnalytics: any[] = [];
    if (isMultiDay && trail.dailyItineraries) {
      // Extract all wineries from daily itineraries
      trail.dailyItineraries.forEach(day => {
        day.stops.forEach(stop => {
          wineriesForAnalytics.push(stop);
        });
      });
    } else if (trail.wineries) {
      wineriesForAnalytics = trail.wineries;
    }

    await sql`
      INSERT INTO trails (
        id, vibe, wine_preferences, group_type, stops, origin_city,
        special_requests, occasion, visit_date_start, visit_date_end,
        trail_name, summary, estimated_duration,
        wineries, is_multi_day, number_of_days, daily_itineraries,
        packing_list, best_time_to_visit,
        user_agent, ip_address
      ) VALUES (
        ${id},
        ${input.vibe},
        ${input.winePreferences},
        ${input.groupType},
        ${input.stops},
        ${input.originCity},
        ${input.specialRequests || null},
        ${input.occasion || null},
        ${input.visitDateStart || null},
        ${input.visitDateEnd || null},
        ${trail.trailName},
        ${trail.summary},
        ${trail.estimatedDurationHours},
        ${JSON.stringify(wineriesForAnalytics)},
        ${isMultiDay},
        ${trail.numberOfDays || null},
        ${isMultiDay && trail.dailyItineraries ? JSON.stringify(trail.dailyItineraries) : null},
        ${trail.packingList ? trail.packingList : null},
        ${trail.bestTimeToVisit || null},
        ${metadata?.userAgent || null},
        ${metadata?.ipAddress || null}
      )
    `;
    
    console.log(`✅ Saved ${isMultiDay ? 'multi-day' : 'single-day'} trail to DB:`, id);
    
    return id;
  } catch (error) {
    console.error('Failed to save trail:', error);
    throw new Error('Database save failed');
  }
}

// Get trail by ID (handles both formats)
export async function getTrailById(id: string): Promise<AITrailResponse | null> {
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
        special_requests as "specialRequests",
        occasion,
        visit_date_start as "visitDateStart",
        visit_date_end as "visitDateEnd",
        trail_name as "trailName",
        summary,
        estimated_duration as "estimatedDuration",
        wineries,
        is_multi_day as "isMultiDay",
        number_of_days as "numberOfDays",
        daily_itineraries as "dailyItineraries",
        packing_list as "packingList",
        best_time_to_visit as "bestTimeToVisit",
        view_count as "viewCount",
        shared_count as "sharedCount",
        last_viewed_at as "lastViewedAt"
      FROM trails
      WHERE id = ${id}
    `;
    
    if (result.length === 0) return null;
    
    const row = result[0];

    // Parse JSON fields
    const wineries = typeof row.wineries === 'string' 
      ? JSON.parse(row.wineries) 
      : row.wineries;
    
    const dailyItineraries = row.dailyItineraries 
      ? (typeof row.dailyItineraries === 'string' 
          ? JSON.parse(row.dailyItineraries) 
          : row.dailyItineraries)
      : undefined;

    // Build response based on single vs multi-day
    const baseTrail: AITrailResponse = {
      id: row.id,
      trailName: row.trailName,
      summary: row.summary,
      totalStops: row.stops,
      estimatedDurationHours: row.estimatedDuration,
    };

    // Add multi-day or single-day specific fields
    if (row.isMultiDay && dailyItineraries) {
      return {
        ...baseTrail,
        isMultiDay: true,
        numberOfDays: row.numberOfDays,
        dailyItineraries,
        packingList: row.packingList,
        bestTimeToVisit: row.bestTimeToVisit,
      };
    } else {
      return {
        ...baseTrail,
        wineries,
      };
    }
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
        COUNT(CASE WHEN is_multi_day THEN 1 END) as multi_day_trails,
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
        shared_count as "sharedCount", vibe, origin_city as "originCity",
        is_multi_day as "isMultiDay", number_of_days as "numberOfDays"
      FROM trails
      ORDER BY view_count DESC
      LIMIT ${limit}
    `;
    
    return result as any[];
  } catch (error) {
    console.error('Failed to get popular trails:', error);
    return [];
  }
}

// Get winery analytics (which wineries are most popular)
export async function getWineryAnalytics(days: number = 30) {
  try {
    // This query extracts winery IDs from the JSONB wineries array
    const result = await sql`
      SELECT 
        jsonb_array_elements(wineries)->>'wineryId' as winery_id,
        COUNT(*) as times_included,
        AVG((jsonb_array_elements(wineries)->>'order')::int) as avg_position
      FROM trails
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY winery_id
      ORDER BY times_included DESC
      LIMIT 20
    `;
    
    return result;
  } catch (error) {
    console.error('Winery analytics query failed:', error);
    return [];
  }
}