import { neon } from '@neondatabase/serverless';

// Create a SQL query function connected to Neon
export const sql = neon(process.env.DATABASE_URL!);

// Type definitions for our database tables
export interface Winery {
  id: string;
  name: string;
  slug: string;
  description: string;
  engaging_description: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  hours: Record<string, string | null>;
  reservation_required: string;
  tasting_fee: string | null;
  tasting_fee_min: number | null;
  tasting_fee_max: number | null;
  quality_score: number;
  google_rating: number | null;
  google_review_count: string | null;
  wine_styles: string[];
  varietals: string[];
  amenities: string[];
  vibe: string[];
  best_for: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  input_mode: 'chat' | 'quick_plan' | 'browse';
  preferences: Record<string, any> | null;
  trip_dates: { start: string; end: string } | null;
  group_size: number | null;
  starting_location: string | null;
  email: string | null;
  created_at: Date;
  last_active_at: Date;
}

export interface Itinerary {
  id: string;
  session_id: string;
  share_token: string;
  title: string | null;
  wineries: Array<{
    winery_id: string;
    day: number;
    order: number;
    suggested_time: string;
  }>;
  narrative: string | null;
  total_drive_time_minutes: number | null;
  total_distance_miles: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  session_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  extracted_preferences: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: string;
  properties: Record<string, any>;
  timestamp: Date;
}
