// Core data types for Valley Somm
// DO NOT MODIFY - These match the PRD specification exactly
import { z } from 'zod';
import { AIInputSchema, AITrailResponseSchema } from './schema';

export type AIInput = z.infer<typeof AIInputSchema>;
export type AITrailResponse = z.infer<typeof AITrailResponseSchema> & { id: string };

export type Winery = {
  id: string;
  name: string;
  description: string;
  vibeTags: string[];
  wineStyles: string[];
  goodFor: string[];
  scenic: boolean;
  lunchNearby: boolean;
  latitude: number;
  longitude: number;
  website?: string;
};

// Enhanced Winery type from database (with all new fields)
export type WineryFromDB = {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  website: string | null;
  
  // Wine details
  signature_wines: Array<{
    name: string;
    variety: string;
    description: string;
    awards?: string[];
  }> | null;
  grape_varieties: string[] | null;
  wine_styles: string[] | null;
  tasting_notes: string | null;
  
  // Experience
  vibe_tags: string[] | null;
  amenities: string[] | null;
  
  // Features
  scenic_views: boolean;
  has_food: boolean;
  has_events: boolean;
  pet_friendly: boolean;
  wheelchair_accessible: boolean;
};

export type TrailWineryStop = {
  wineryId: string;
  order: number;
  whyItsIncluded: string;
  suggestedArrivalTime: string;
  whatToTry: string;
};

// ============================================
// MULTI-DAY ITINERARY TYPES
// ============================================

export type DayItinerary = {
  day: number;
  date?: string; // ISO date string if visit date provided
  theme: string; // e.g., "Bold Reds Day", "Scenic Views Day"
  stops: TrailWineryStop[];
  estimatedDuration: string; // e.g., "6 hours"
  recommendations: {
    lunch?: string; // Restaurant recommendation
    dinner?: string; // Restaurant recommendation
    accommodation?: string; // Hotel/B&B suggestion
  };
};

// Weather information for the visit
export type WeatherInfo = {
  date: string; // ISO date string
  avgTemp: number; // Fahrenheit
  conditions: string; // e.g., "Sunny", "Partly Cloudy"
  precipitation: number; // Percentage chance
  historicalNote: string; // e.g., "Typically warm and dry in October"
};

// Winery review data (from Google Places or other sources)
export type WineryReview = {
  rating: number; // 1-5
  totalReviews: number;
  highlights: string[]; // e.g., ["Great views", "Knowledgeable staff"]
  source: 'google' | 'facebook' | 'aggregate';
};

// Enhanced trail response with multi-day support
export type EnhancedTrailResponse = AITrailResponse & {
  // Multi-day fields
  isMultiDay: boolean;
  numberOfDays?: number;
  dailyItineraries?: DayItinerary[];
  
  // Enhanced metadata
  bestTimeToVisit?: string; // e.g., "Fall for harvest season and beautiful foliage"
  weatherForecast?: WeatherInfo;
  packingList?: string[]; // e.g., ["Sunscreen", "Camera", "Light jacket"]
  
  // Tips and recommendations
  drivingTips?: string[];
  localInsights?: string[];
};

// Extended winery type with operating hours and events
export type EnhancedWinery = Winery & {
  // Operating information
  hours?: {
    [key: string]: string; // e.g., "Monday": "11am-6pm", "Tuesday": "Closed"
  };
  seasonalHours?: string; // e.g., "Extended summer hours May-September"
  
  // Pricing
  priceRange?: '$' | '$$' | '$$$';
  tastingFee?: number; // In dollars
  tastingFeeWaived?: string; // e.g., "with wine purchase"
  
  // Events and experiences
  specialEvents?: Array<{
    name: string;
    date: string;
    description: string;
  }>;
  experiences?: string[]; // e.g., ["Vineyard tours", "Wine & cheese pairing"]
  
  // Historical/educational
  established?: number; // Year founded
  accolades?: string[]; // Awards, certifications
  story?: string; // Brief history
  
  // Reviews
  reviews?: WineryReview;
};

// Duration options for trails
export type TrailDuration = 'half-day' | 'full-day' | 'weekend' | 'multi-day';

// Extended AI input for multi-day support
export type ExtendedAIInput = AIInput & {
  // Duration
  duration?: TrailDuration;
  numberOfDays?: number; // Only if multi-day selected
  
  // Visit timing
  visitDate?: string; // ISO date string for weather lookups
  
  // Accommodation preferences
  accommodationPreference?: 'luxury' | 'budget' | 'bnb' | 'none';
  mealsIncluded?: boolean;
};