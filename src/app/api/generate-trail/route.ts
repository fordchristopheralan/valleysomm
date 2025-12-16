import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { neon } from '@neondatabase/serverless';
import { AIInputSchema, AITrailResponseSchema } from '@/lib/schema';
import type { AIInput, AITrailResponse, WineryFromDB } from '@/lib/types';
import { saveTrail } from '@/lib/db/trails';
import { customAlphabet } from 'nanoid';

// Short ID generator — 10 chars, lowercase letters + numbers
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

// System prompt (enhanced for richer context)
const SYSTEM_PROMPT = `You are Valley Somm, a friendly, confident local guide helping visitors plan a stress-free wine weekend in Yadkin Valley, North Carolina.

Your visitors are traveling from various cities in North Carolina.
They are not wine experts - speak in welcoming, accessible language.

CRITICAL RULES:
1. You may ONLY recommend wineries from the provided database
2. Use EXACT winery IDs - do NOT invent or modify them
3. For each winery, recommend SPECIFIC wines from their signature_wines list
4. Create NARRATIVE ARCS - tell a story through the wineries
5. Consider the OCCASION and SPECIAL REQUESTS carefully
6. VARY your recommendations - don't be repetitive

Return JSON ONLY in the provided schema.`;

// Build enhanced user prompt with database wineries
function buildUserPrompt(input: AIInput, wineries: WineryFromDB[]): string {
  const validIds = wineries.map(w => w.id).sort().join(', ');

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

  return `USER CONTEXT:
- Visit Dates: ${input.visitDateStart ? `${input.visitDateStart} to ${input.visitDateEnd || 'TBD'}` : 'Not specified'}
- Occasion: ${input.occasion || 'casual visit'}
- Special Requests: ${input.specialRequests || 'none'}
- Vibe Preference: ${input.vibe}
- Wine Preferences: ${input.winePreferences.join(', ')}
- Group Type: ${input.groupType}
- Number of Stops: ${input.stops}
- Starting From: ${input.originCity}
${input.dislikes ? `- Dislikes: ${input.dislikes}` : ''}

AVAILABLE WINERIES (USE EXACT IDs):
${wineryDescriptions}

CRITICAL INSTRUCTIONS:
1. You MUST use ONLY these exact winery IDs: ${validIds}
2. For EACH winery, recommend a SPECIFIC wine from their signature_wines list
3. Create a STORY ARC considering their occasion (${input.occasion || 'casual visit'})
4. If special requests mention accessibility, dietary needs, or preferences - ADDRESS them specifically
5. Optimize route for minimal driving from ${input.originCity}
6. VARY your recommendations - explore different combinations, don't always pick the same favorites
7. Consider visit dates for seasonal recommendations if provided

RESPONSE FORMAT (JSON only):
{
  "trailName": "Creative name reflecting their occasion and preferences",
  "summary": "2-3 sentence narrative overview of their wine journey",
  "totalStops": ${input.stops},
  "estimatedDurationHours": ${input.stops + 1},
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

// Fallback trail (using database IDs that should exist)
function getFallbackTrail(stops: number): AITrailResponse {
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
    trailName: 'Classic Yadkin Valley Trail',
    summary: 'A perfect introduction to the best of Yadkin Valley with iconic views, variety, and European flair.',
    totalStops: stops,
    estimatedDurationHours: stops + 1,
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

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const input = AIInputSchema.parse(await request.json());

    // Fetch wineries from database
    const wineries = await sql`
  ...
` as unknown as WineryFromDB[];
      SELECT 
        id, name, description, latitude, longitude, website,
        signature_wines, grape_varieties, wine_styles, tasting_notes,
        vibe_tags, amenities,
        scenic_views, has_food, has_events, pet_friendly, wheelchair_accessible
      FROM wineries
      ORDER BY name
    `;

    console.log(`Loaded ${wineries.length} wineries from database`);

    if (wineries.length === 0) {
      throw new Error('No wineries found in database');
    }

    // Generate trail with AI
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input, wineries) }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7, // Increased from 0.5 for more variety
      max_tokens: 2500, // Increased for richer responses
      response_format: { type: 'json_object' }
    });

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
    let invalidIds = validateWineryIds(validated, wineries);

    // Retry once if invalid IDs
    if (invalidIds.length > 0) {
      console.log('Invalid IDs detected:', invalidIds);
      const validIdList = wineries.map(w => w.id).join(', ');

      const retryCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: buildUserPrompt(input, wineries) + `\n\n⚠️ YOU USED INVALID IDs: ${invalidIds.join(', ')}. ONLY use these EXACT IDs: ${validIdList}. If unsure, use 'shelton', 'jolo', or 'raffaldini'.`
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      });

      const retryResponse = retryCompletion.choices[0]?.message?.content;
      if (retryResponse) {
        try {
          const retryParsed = JSON.parse(retryResponse);
          const retryData = AITrailResponseSchema.parse(retryParsed);
          const retryValidated: AITrailResponse = { ...retryData, id: 'temp' };
          const retryInvalidIds = validateWineryIds(retryValidated, wineries);

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
      validated = getFallbackTrail(parseInt(input.stops));
    }

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

    // Return fallback trail
    const fallback = getFallbackTrail(3);
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
