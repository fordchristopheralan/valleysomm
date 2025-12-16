import { z } from 'zod';

// Zod schemas for runtime validation

export const AIInputSchema = z.object({
  vibe: z.string().min(1, 'Vibe is required'),
  winePreferences: z.array(z.string()).min(1, 'Select at least one wine preference'),
  dislikes: z.string().optional(),
  groupType: z.string().min(1, 'Group type is required'),
  stops: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(3).max(5, 'Must be between 3 and 5 stops')
  ),
  originCity: z.string().min(1, 'Origin city is required'),
  visitLength: z.string().optional(), // Not in current questionnaire
  priorities: z.array(z.string()).optional(), // Not in current questionnaire
  
  // NEW FIELDS - Enhanced questionnaire
  visitDateStart: z.string().optional(), // ISO date string
  visitDateEnd: z.string().optional(), // ISO date string
  occasion: z.string().optional(), // casual, romantic, celebration, etc.
  specialRequests: z.string().optional(), // free text for accessibility, dietary, etc.
});

export const TrailWineryStopSchema = z.object({
  wineryId: z.string().min(1, 'Winery ID is required'),
  order: z.number().int().positive(),
  whyItsIncluded: z.string().min(10, 'Explanation must be at least 10 characters'),
  suggestedArrivalTime: z.string().min(1, 'Arrival time is required'),
  whatToTry: z.string().min(5, 'Wine suggestion is required')
});

export const AITrailResponseSchema = z.object({
  trailName: z.string().min(5, 'Trail name must be at least 5 characters'),
  summary: z.string().min(20, 'Summary must be at least 20 characters'),
  totalStops: z.number().int().min(3).max(5),
  estimatedDurationHours: z.number().positive(),
  wineries: z.array(TrailWineryStopSchema).min(3).max(5)
});

// Type inference from schemas
export type AIInputType = z.infer<typeof AIInputSchema>;
export type AITrailResponseType = z.infer<typeof AITrailResponseSchema>;
export type TrailWineryStopType = z.infer<typeof TrailWineryStopSchema>;