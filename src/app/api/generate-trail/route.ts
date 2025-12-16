import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { neon } from '@neondatabase/serverless';
import { AIInputSchema, AITrailResponseSchema } from '@/lib/schema';
import type { AIInput, AITrailResponse, WineryFromDB } from '@/lib/types';
import { saveTrail } from '@/lib/db/trails';
import { customAlphabet } from 'nanoid';

// Timeout configuration
const GENERATION_TIMEOUT = 45000; // 45 seconds
const GROQ_TIMEOUT = 30000; // 30 seconds for Groq API

// Timeout wrapper utility
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// Short ID generator – 10 chars, lowercase letters + numbers
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

// System prompt (enhanced for multi-day and richer context)
const SYSTEM_PROMPT = `You are Valley Somm, a friendly, confident local guide helping visitors plan unforgettable wine experiences in Yadkin Valley, North Carolina.

Your visitors are traveling from various cities in North Carolina. They range from wine novices to enthusiasts - always speak in welcoming, accessible language that makes wine approachable and fun.

CRITICAL RULES:
1. You may ONLY recommend wineries from the provided database
2. Use EXACT winery IDs - do NOT invent or modify them
3. For each winery, recommend SPECIFIC wines from their signature_wines list
4. Create NARRATIVE ARCS - tell a story through the wineries
5. Consider the OCCASION and SPECIAL REQUESTS carefully
6. VARY your recommendations - don't be repetitive
7. For multi-day trips, organize wineries into themed days with logical flow
8. Include meal and accommodation recommendations for multi-day trips
9. Consider seasonal factors and weather when making recommendations

Return JSON ONLY in the provided schema.`;

// Determine if this is a multi-day trip
function isMultiDayTrip(input: AIInput): boolean {
  // Check if they have visit dates spanning multiple days
  if (input.visitDateStart && input.visitDateEnd) {
    const start = new Date(input.visitDateStart);
    const end = new Date(input.visitDateEnd);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 0;
  }
  return false;
}

// Calculate number of days for trip
function calculateDays(input: AIInput): number {
  if (input.visitDateStart && input.visitDateEnd) {
    const start = new Date(input.visitDateStart);
    const end = new Date(input.visitDateEnd);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  return 1;
}

// Get seasonal recommendation based on visit date
function getSeasonalContext(visitDate?: string): string {
  if (!visitDate) return '';
  
  const date = new Date(visitDate);
  const month = date.getMonth();
  
  const seasonalNotes: { [key: number]: string } = {
    0: 'January: Cooler weather, perfect for cozy tasting rooms and bold reds. Dress warmly!',
    1: 'February: Late winter charm with fewer crowds. Great for intimate tastings.',
    2: 'March: Spring arrives! Early blooms and mild temperatures make for pleasant vineyard walks.',
    3: 'April: Beautiful spring weather with blooming vineyards. Perfect touring conditions.',
    4: 'May: Ideal weather! Warm days, vineyards in full bloom. Peak season begins.',
    5: 'June: Summer warmth begins. Morning tastings recommended. Perfect for rosé!',
    6: 'July: Hot summer days - plan early tastings or shaded patios. Stay hydrated!',
    7: 'August: Peak summer heat. Seek wineries with AC or outdoor shade. Great for whites!',
    8: 'September: Harvest season excitement! Watch grape picking, mild temperatures return.',
    9: 'October: PERFECT! Fall colors, harvest celebrations, comfortable weather. Peak season!',
    10: 'November: Crisp fall air, fewer crowds, cozy tasting rooms. Great for bold reds.',
    11: 'December: Holiday festivities at wineries, special events, festive atmosphere.'
  };
  
  return seasonalNotes[month] || '';
}

// Build enhanced user prompt with database wineries
function buildUserPrompt(input: AIInput, wineries: WineryFromDB[]): string {
  const validIds = wineries.map(w => w.id).sort().join(', ');
  const multiDay = isMultiDayTrip(input);
  const numDays = calculateDays(input);
  const seasonalContext = getSeasonalContext(input.visitDateStart);

  // Format winery data with signature wines
  const wineryDescriptions = wineries.map(w => {
    const signatureWines = w.signature_wines 
      ? w.signature_wines.map(wine => 
          `  - ${wine.name} (${wine.variety}): ${wine.description}${wine.awards?.length ? ` [Awards: ${wine.awards.join(', ')}]` : ''}`
        ).join('\n')
      : '  (Signature wines not yet documented)';

    return `
${w.name} (ID: "${w.id}"):
  Location: ${w.latitude}, ${w.longitude}
  Vibe: ${w.vibe_tags?.join(', ') || 'N/A'}
  Wine Styles: ${w.wine_styles?.join(', ') || 'N/A'}
  Grape Varieties: ${w.grape_varieties?.join(', ') || 'N/A'}
  Signature Wines:
${signatureWines}
  Tasting Notes: ${w.tasting_notes || 'N/A'}
  Features: ${[
    w.scenic_views && 'scenic views',
    w.has_food && 'food available',
    w.pet_friendly && 'pet-friendly',
    w.wheelchair_accessible && 'wheelchair accessible'
  ].filter(Boolean).join(', ') || 'N/A'}
  Amenities: ${w.amenities?.join(', ') || 'N/A'}`;
  }).join('\n');

  const baseContext = `USER CONTEXT:
- Visit Dates: ${input.visitDateStart ? `${input.visitDateStart}${input.visitDateEnd ? ` to ${input.visitDateEnd}` : ''}` : 'Not specified'}
- Trip Duration: ${multiDay ? `${numDays} days (MULTI-DAY TRIP)` : 'Single day'}
- Occasion: ${input.occasion || 'casual visit'}
- Special Requests: ${input.specialRequests || 'none'}
- Vibe Preference: ${input.vibe}
- Wine Preferences: ${input.winePreferences.join(', ')}
- Group Type: ${input.groupType}
- Number of Stops: ${input.stops} total
- Starting From: ${input.originCity}
${input.dislikes ? `- Dislikes: ${input.dislikes}` : ''}
${seasonalContext ? `\nSEASONAL CONTEXT:\n${seasonalContext}` : ''}

AVAILABLE WINERIES (USE EXACT IDs):
${wineryDescriptions}`;

  // Different response format for multi-day vs single-day
  if (multiDay) {
    const stopsPerDay = Math.ceil(input.stops / numDays);
    
    return `${baseContext}

MULTI-DAY TRIP INSTRUCTIONS:
1. Organize ${input.stops} wineries into ${numDays} themed days
2. Each day should have ${stopsPerDay}-${stopsPerDay + 1} wineries
3. Create a unique theme for each day (e.g., "Bold Reds Day", "Scenic Views & Whites Day")
4. Consider geographical clustering - minimize driving each day
5. Balance intensity - don't put all the best wineries on day 1
6. Recommend lunch and dinner spots near the wineries
7. Suggest accommodation options (B&Bs, hotels in Mount Airy, Elkin, etc.)
8. Optimize routes starting from ${input.originCity}

RESPONSE FORMAT (JSON only):
{
  "trailName": "Creative name for the entire ${numDays}-day journey",
  "summary": "2-3 sentence narrative overview of the multi-day wine adventure",
  "totalStops": ${input.stops},
  "estimatedDurationHours": ${numDays * 6},
  "isMultiDay": true,
  "numberOfDays": ${numDays},
  "dailyItineraries": [
    {
      "day": 1,
      "theme": "Descriptive theme for day 1 (e.g., 'Mountain Views & Bold Reds')",
      "stops": [
        {
          "wineryId": "EXACT ID from list",
          "order": 1,
          "whyItsIncluded": "Why this winery fits the day's theme and their preferences",
          "suggestedArrivalTime": "10:30 AM",
          "whatToTry": "SPECIFIC wine from signature_wines"
        }
      ],
      "estimatedDuration": "6 hours",
      "recommendations": {
        "lunch": "Restaurant name and location (e.g., 'The Vineyards Restaurant in Dobson')",
        "dinner": "Restaurant name and location",
        "accommodation": "Hotel/B&B suggestion with area (e.g., 'Hampton Inn in Mount Airy' or 'Pilot Knob Inn B&B')"
      }
    }
  ],
  "packingList": ["Comfortable shoes", "Camera", "Sunscreen", "Light jacket", "Cooler for wine purchases"],
  "bestTimeToVisit": "Brief note about the season and why it's great for their dates"
}`;
  } else {
    // Single day format (existing)
    return `${baseContext}

SINGLE-DAY TRIP INSTRUCTIONS:
1. You MUST use ONLY these exact winery IDs: ${validIds}
2. For EACH winery, recommend a SPECIFIC wine from their signature_wines list
3. Create a STORY ARC considering their occasion (${input.occasion || 'casual visit'})
4. If special requests mention accessibility, dietary needs, or preferences - ADDRESS them specifically
5. Optimize route for minimal driving from ${input.originCity}
6. VARY your recommendations - explore different combinations
7. Consider seasonal factors: ${seasonalContext || 'N/A'}

RESPONSE FORMAT (JSON only):
{
  "trailName": "Creative name reflecting their occasion and preferences",
  "summary": "2-3 sentence narrative overview of their wine journey",
  "totalStops": ${input.stops},
  "estimatedDurationHours": ${input.stops + 1},
  "isMultiDay": false,
  "wineries": [
    {
      "wineryId": "EXACT ID from list above",
      "order": 1,
      "whyItsIncluded": "Specific reason matching their preferences and occasion",
      "suggestedArrivalTime": "Time like '11:00 AM'",
      "whatToTry": "SPECIFIC wine name from signature_wines, e.g., 'Pilot Mountain Red' or 'Sangiovese Reserve'"
    }
  ]
}`;
  }
}

// Fallback trail (enhanced for multi-day)
function getFallbackTrail(stops: number, multiDay: boolean = false, numDays: number = 1): AITrailResponse {
  const fallbackWineries = [
    {
      wineryId: 'shelton',
      order: 1,
      whyItsIncluded: "North Carolina's largest estate winery offers a perfect introduction with excellent variety and educational tours",
      suggestedArrivalTime: '11:00 AM',
      whatToTry: 'Cabernet Sauvignon Estate'
    },
    {
      wineryId: 'jolo',
      order: 2,
      whyItsIncluded: 'Stunning Pilot Mountain views create an iconic photo opportunity, plus award-winning wines',
      suggestedArrivalTime: '1:00 PM',
      whatToTry: 'Pilot Mountain Red'
    },
    {
      wineryId: 'raffaldini',
      order: 3,
      whyItsIncluded: 'Italian-inspired wines and beautiful grounds offer a unique European experience',
      suggestedArrivalTime: '3:00 PM',
      whatToTry: 'Sangiovese Reserve'
    },
    {
      wineryId: 'round-peak',
      order: 4,
      whyItsIncluded: 'Peaceful mountain vistas and French varietals for a relaxing afternoon',
      suggestedArrivalTime: '4:30 PM',
      whatToTry: 'Cabernet Franc'
    },
    {
      wineryId: 'adagio',
      order: 5,
      whyItsIncluded: 'Intimate European-style finish to your wine trail',
      suggestedArrivalTime: '6:00 PM',
      whatToTry: 'Sangiovese'
    },
  ].slice(0, stops);

  return {
    id: nanoid(),
    trailName: multiDay ? `${numDays}-Day Yadkin Valley Experience` : 'Classic Yadkin Valley Trail',
    summary: multiDay 
      ? `A curated ${numDays}-day journey through Yadkin Valley's finest wineries, featuring scenic views, award-winning wines, and unforgettable experiences.`
      : 'A perfect introduction to the best of Yadkin Valley with iconic views, variety, and European flair.',
    totalStops: stops,
    estimatedDurationHours: multiDay ? numDays * 6 : stops + 1,
    wineries: fallbackWineries
  };
}

// Validate winery IDs against database
function validateWineryIds(trail: AITrailResponse, wineries: WineryFromDB[]): string[] {
  const validIds = new Set(wineries.map((w) => w.id));
  return trail.wineries
    .map((stop: { wineryId: string }) => stop.wineryId)
    .filter((id: string) => !validIds.has(id));
}

// Main trail generation logic (wrapped for timeout)
async function generateTrailWithGroq(
  input: AIInput,
  wineries: WineryFromDB[]
): Promise<AITrailResponse> {
  const multiDay = isMultiDayTrip(input);
  const numDays = calculateDays(input);
  
  console.log(`Generating ${multiDay ? `${numDays}-day multi-day` : 'single-day'} trail`);

  // Generate trail with AI (with timeout)
  const completion = await withTimeout(
    groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input, wineries) }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: multiDay ? 4000 : 2500, // More tokens for multi-day responses
      response_format: { type: 'json_object' }
    }),
    GROQ_TIMEOUT,
    'AI generation timeout - please try again'
  );

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No response from AI');

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch (e) {
    throw new Error('Invalid JSON from AI');
  }

  let trailData = AITrailResponseSchema.parse(parsed);
  let validated: AITrailResponse = { ...trailData, id: 'temp' };
  
  // For multi-day, validate IDs across all days
  let invalidIds: string[] = [];
  if (parsed.isMultiDay && parsed.dailyItineraries) {
    const validIds = new Set(wineries.map((w) => w.id));
    parsed.dailyItineraries.forEach((day: any) => {
      day.stops?.forEach((stop: any) => {
        if (!validIds.has(stop.wineryId)) {
          invalidIds.push(stop.wineryId);
        }
      });
    });
  } else {
    invalidIds = validateWineryIds(validated, wineries);
  }

  // Retry once if invalid IDs (with timeout)
  if (invalidIds.length > 0) {
    console.log('Invalid IDs detected:', invalidIds);
    const validIdList = wineries.map(w => w.id).join(', ');

    const retryCompletion = await withTimeout(
      groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: buildUserPrompt(input, wineries) + `\n\n⚠️ YOU USED INVALID IDs: ${invalidIds.join(', ')}. ONLY use these EXACT IDs: ${validIdList}. If unsure, use 'shelton', 'jolo', or 'raffaldini'.`
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: multiDay ? 4000 : 2500,
        response_format: { type: 'json_object' }
      }),
      GROQ_TIMEOUT,
      'AI retry timeout'
    );

    const retryResponse = retryCompletion.choices[0]?.message?.content;
    if (retryResponse) {
      try {
        const retryParsed = JSON.parse(retryResponse);
        const retryData = AITrailResponseSchema.parse(retryParsed);
        const retryValidated: AITrailResponse = { ...retryData, id: 'temp' };
        
        // Re-validate
        let retryInvalidIds: string[] = [];
        if (retryParsed.isMultiDay && retryParsed.dailyItineraries) {
          const validIds = new Set(wineries.map((w) => w.id));
          retryParsed.dailyItineraries.forEach((day: any) => {
            day.stops?.forEach((stop: any) => {
              if (!validIds.has(stop.wineryId)) {
                retryInvalidIds.push(stop.wineryId);
              }
            });
          });
        } else {
          retryInvalidIds = validateWineryIds(retryValidated, wineries);
        }

        if (retryInvalidIds.length === 0) {
          validated = retryValidated;
          invalidIds = [];
        }
      } catch (e) {
        console.error('Retry failed to parse:', e);
      }
    }
  }

  // If still invalid, use fallback
  if (invalidIds.length > 0) {
    console.error('AI failed to use valid IDs after retry, using fallback');
    validated = getFallbackTrail(input.stops, multiDay, numDays);
  }

  return validated;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const input = AIInputSchema.parse(await request.json());

    // Fetch wineries from database (with timeout)
    const wineriesResult = await withTimeout(
      sql`
        SELECT 
          id, name, description, latitude, longitude, website,
          signature_wines, grape_varieties, wine_styles, tasting_notes,
          vibe_tags, amenities,
          scenic_views, has_food, has_events, pet_friendly, wheelchair_accessible
        FROM wineries
        ORDER BY name
      `,
      5000, // 5 second timeout for DB query
      'Database query timeout'
    );
    
    const wineries = wineriesResult as unknown as WineryFromDB[];

    console.log(`Loaded ${wineries.length} wineries from database`);

    if (wineries.length === 0) {
      throw new Error('No wineries found in database');
    }

    // Generate trail with overall timeout wrapper
    const validated = await withTimeout(
      generateTrailWithGroq(input, wineries),
      GENERATION_TIMEOUT,
      'Trail generation timeout - please try again'
    );

    // Save to DB with enhanced fields
    let trailId = nanoid();
    const metadata = {
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: 
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        undefined
    };

    try {
      trailId = await saveTrail(input, validated, metadata);
      console.log('Trail saved to DB with ID:', trailId);
    } catch (dbError) {
      console.error('Failed to save trail to DB:', dbError);
      console.log('Using generated ID:', trailId);
    }

    return NextResponse.json({
      ...validated,
      id: trailId
    });

  } catch (error) {
    console.error('Critical trail generation failure:', error);

    // If timeout error, return fallback with helpful message
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('⏱️ Timeout occurred, returning fallback trail');
      const fallback = getFallbackTrail(3, false, 1);
      const trailId = nanoid();

      return NextResponse.json({
        ...fallback,
        id: trailId,
        note: 'Generated from fallback due to timeout - refresh to try again'
      });
    }

    // Return fallback trail for any other error
    const fallback = getFallbackTrail(3, false, 1);
    const trailId = nanoid();

    return NextResponse.json({
      ...fallback,
      id: trailId
    });
  }
}

// Health check - now checks database connection
export async function GET() {
  try {
    const wineries = await sql`SELECT COUNT(*) as count FROM wineries`;
    const wineryCount = parseInt(wineries[0]?.count || '0');

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      wineries: wineryCount,
      hasApiKey: !!process.env.GROQ_API_KEY
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.GROQ_API_KEY
    }, { status: 500 });
  }
}