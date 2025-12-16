import { z } from 'zod';

// ============================================
// INPUT SCHEMAS
// ============================================

export const AIInputSchema = z.object({
  vibe: z.string().min(1, 'Vibe is required'),
  winePreferences: z.array(z.string()).min(1, 'Select at least one wine preference'),
  dislikes: z.string().optional(),
  groupType: z.string().min(1, 'Group type is required'),
  stops: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(3).max(5, 'Must be between 3 and 5 stops')
  ),
  originCity: z.string().min(1, 'Origin city is required'),
  
  // Enhanced fields
  visitDateStart: z.string().optional(), // ISO date string
  visitDateEnd: z.string().optional(),   // ISO date string
  occasion: z.string().optional(),       // e.g., "birthday", "anniversary"
  specialRequests: z.string().optional(), // Free text for accessibility, dietary needs, etc.
  
  // Legacy fields (optional)
  visitLength: z.string().optional(),
  priorities: z.array(z.string()).optional(),
});

// ============================================
// TRAIL RESPONSE SCHEMAS
// ============================================

export const TrailWineryStopSchema = z.object({
  wineryId: z.string().min(1, 'Winery ID is required'),
  order: z.number().int().positive(),
  whyItsIncluded: z.string().min(10, 'Explanation must be at least 10 characters'),
  suggestedArrivalTime: z.string().min(1, 'Arrival time is required'),
  whatToTry: z.string().min(5, 'Wine suggestion is required')
});

// Daily itinerary schema for multi-day trips
export const DayItinerarySchema = z.object({
  day: z.number().int().positive(),
  date: z.string().optional(), // ISO date string
  theme: z.string().min(5, 'Day theme is required'),
  stops: z.array(TrailWineryStopSchema).min(1),
  estimatedDuration: z.string().min(1, 'Duration estimate required'),
  recommendations: z.object({
    lunch: z.string().optional(),
    dinner: z.string().optional(),
    accommodation: z.string().optional(),
  }),
});

// Weather information schema
export const WeatherInfoSchema = z.object({
  date: z.string(),
  avgTemp: z.number(),
  conditions: z.string(),
  precipitation: z.number().min(0).max(100),
  historicalNote: z.string(),
});

// Base trail response (single-day)
export const AITrailResponseSchema = z.object({
  trailName: z.string().min(5, 'Trail name must be at least 5 characters'),
  summary: z.string().min(20, 'Summary must be at least 20 characters'),
  totalStops: z.number().int().min(3).max(10), // Increased max for multi-day
  estimatedDurationHours: z.number().positive(),
  
  // Single-day format
  wineries: z.array(TrailWineryStopSchema).min(3).max(10).optional(),
  
  // Multi-day format
  isMultiDay: z.boolean().optional(),
  numberOfDays: z.number().int().positive().optional(),
  dailyItineraries: z.array(DayItinerarySchema).optional(),
  
  // Enhanced metadata
  bestTimeToVisit: z.string().optional(),
  weatherForecast: WeatherInfoSchema.optional(),
  packingList: z.array(z.string()).optional(),
  
  // Tips and insights
  drivingTips: z.array(z.string()).optional(),
  localInsights: z.array(z.string()).optional(),
}).refine((data) => {
  // Validation: Either wineries OR dailyItineraries must be present
  if (data.isMultiDay) {
    return !!data.dailyItineraries && data.dailyItineraries.length > 0;
  } else {
    return !!data.wineries && data.wineries.length >= 3;
  }
}, {
  message: 'Either wineries (single-day) or dailyItineraries (multi-day) must be provided'
});

// ============================================
// TYPE INFERENCE
// ============================================

export type AIInputType = z.infer<typeof AIInputSchema>;
export type AITrailResponseType = z.infer<typeof AITrailResponseSchema>;
export type TrailWineryStopType = z.infer<typeof TrailWineryStopSchema>;
export type DayItineraryType = z.infer<typeof DayItinerarySchema>;
export type WeatherInfoType = z.infer<typeof WeatherInfoSchema>;