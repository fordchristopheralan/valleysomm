// Core data types for Valley Somm
// DO NOT MODIFY - These match the PRD specification exactly
import { z } from 'zod';  // ← ADD THIS LINE
import { AIInputSchema, AITrailResponseSchema } from './schema';

export type AIInput = z.infer<typeof AIInputSchema>;
export type AITrailResponse = z.infer<typeof AITrailResponseSchema>;

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

export type TrailWineryStop = {
  wineryId: string;
  order: number;
  whyItsIncluded: string;
  suggestedArrivalTime: string;
  whatToTry: string;
};