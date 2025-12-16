// Core data types for Valley Somm
// DO NOT MODIFY - These match the PRD specification exactly
import { z } from 'zod';
import { AIInputSchema, AITrailResponseSchema } from './schema';

export type AIInput = z.infer<typeof AIInputSchema>;
export type AITrailResponse = z.infer<typeof AITrailResponseSchema> & { id: string };  // ← ADD & { id: string }

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