// Core data types for Valley Somm
// DO NOT MODIFY - These match the PRD specification exactly

export type AIInput = {
  vibe: string;
  winePreferences: string[];
  dislikes?: string;
  groupType: string;
  stops: number;
  originCity: string;
  visitLength: string;
  priorities: string[];
};

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

export type AITrailResponse = {
  trailName: string;
  summary: string;
  totalStops: number;
  estimatedDurationHours: number;
  wineries: {
    wineryId: string;
    order: number;
    whyItsIncluded: string;
    suggestedArrivalTime: string;
    whatToTry: string;
  }[];
};

export type TrailWineryStop = {
  wineryId: string;
  order: number;
  whyItsIncluded: string;
  suggestedArrivalTime: string;
  whatToTry: string;
};