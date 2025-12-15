import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { WINERIES } from '@/lib/wineries';
import { AIInputSchema, AITrailResponseSchema } from '@/lib/schema';
import type { AIInput, AITrailResponse } from '@/lib/types';
import { saveTrail } from '@/lib/db/trails';
import { customAlphabet } from 'nanoid';

// Short ID generator — matches your existing style (10 chars, lowercase + numbers)
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// System prompt - defines AI behavior
const SYSTEM_PROMPT = `You are Valley Somm, a friendly, confident local guide helping visitors plan a stress-free wine weekend in Yadkin Valley, North Carolina.

Your visitors are traveling from Charlotte, Winston-Salem, Greensboro, or Raleigh.
They are not wine experts.

Use simple, welcoming language.
Focus on confidence and enjoyment.

You may ONLY recommend wineries included in the provided dataset.
Do NOT invent wineries.
Do NOT mention reservations, pricing, or availability.

IMPORTANT: Create diverse trails. Even for similar preferences, explore different winery combinations to give visitors variety. Don't always pick the same "safe" choices.

Return JSON ONLY in the provided schema.`;

// Build user prompt with preferences and winery data
function buildUserPrompt(input: AIInput): string {
  const validIds = WINERIES.map(w => w.id).sort().join(', ');

  return `Visitor preferences:
- Vibe: ${input.vibe}
- Wine preferences: ${input.winePreferences.join(', ')}
- Group type: ${input.groupType}
- Number of stops: ${input.stops}
- Traveling from: ${input.originCity}
${input.dislikes ? `- Dislikes: ${input.dislikes}` : ''}

Available wineries (ONLY use these exact IDs):
${JSON.stringify(WINERIES, null, 2)}

CRITICAL RULES - YOU MUST FOLLOW EXACTLY:
1. You may ONLY use these exact winery IDs: ${validIds}
2. Do NOT invent, typo, or modify any IDs (e.g., no 'surrystore', 'surry', etc.)
3. Every "wineryId" in your response MUST appear exactly as listed above
4. If you cannot find matching wineries, use safe defaults like 'shelton', 'jolo', 'raffaldini'

Requirements:
- Choose exactly ${input.stops} wineries from the dataset above
- Optimize for minimal driving distance
- Match the requested vibe and wine preferences as closely as possible
- Suggest a logical visit order (morning to evening)
- Use friendly, non-technical language
- Provide specific arrival times (e.g., "11:00 AM", "1:30 PM")
- For each winery, explain WHY it fits their preferences

Return JSON only matching this exact structure:
{
  "trailName": "Creative name for the trail",
  "summary": "2-3 sentence overview of the day",
  "totalStops": ${input.stops},
  "estimatedDurationHours": ${input.stops + 1},
  "wineries": [
    {
      "wineryId": "EXACT ID from list above",
      "order": 1,
      "whyItsIncluded": "Specific reason matching preferences",
      "suggestedArrivalTime": "Time like '11:00 AM'",
      "whatToTry": "Specific wine recommendation"
    }
  ]
}`;
}

// Fallback trail if AI fails
function getFallbackTrail(stops: number): AITrailResponse {
  const fallbackWineries = [
    {
      wineryId: 'shelton',
      order: 1,
      whyItsIncluded: "North Carolina's largest estate winery offers a perfect introduction with excellent variety and educational tours",
      suggestedArrivalTime: '11:00 AM',
      whatToTry: 'Cabernet Sauvignon and Chardonnay'
    },
    {
      wineryId: 'jolo',
      order: 2,
      whyItsIncluded: 'Stunning Pilot Mountain views create an iconic photo opportunity, plus award-winning wines',
      suggestedArrivalTime: '1:00 PM',
      whatToTry: 'Viognier and Chambourcin'
    },
    {
      wineryId: 'raffaldini',
      order: 3,
      whyItsIncluded: 'Italian-inspired wines and beautiful grounds offer a unique European experience',
      suggestedArrivalTime: '3:00 PM',
      whatToTry: 'Sangiovese and Vermentino'
    },
  ].slice(0, stops);

  return {
    id: nanoid(), // ← Add this line: generate a short ID for fallback
    trailName: 'Classic Yadkin Valley Trail',
    summary: 'A perfect introduction to the best of Yadkin Valley with iconic views, variety, and Italian flair.',
    totalStops: stops,
    estimatedDurationHours: stops + 1,
    wineries: fallbackWineries
  };
}

// Validate winery IDs against dataset
function validateWineryIds(trail: AITrailResponse): string[] {
  const validIds = new Set(WINERIES.map(w => w.id));
  return trail.wineries
    .map(w => w.wineryId)
    .filter(id => !validIds.has(id));
}

export async function POST(request: NextRequest) {
  try {
    const input = AIInputSchema.parse(await request.json());

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input) }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 2000,
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

    let validated = AITrailResponseSchema.parse(parsed);
    const invalidIds = validateWineryIds(validated);

    // If invalid IDs, retry once with stronger prompt
    if (invalidIds.length > 0) {
      console.log('Invalid IDs detected:', invalidIds);
      const validIdList = WINERIES.map(w => w.id).join(', ');

      const retryCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: buildUserPrompt(input) + `\n\nYOU PREVIOUSLY USED INVALID IDs (e.g., '${invalidIds.join("', '")}'). THIS IS NOT ALLOWED. 
You MUST only use these exact IDs: ${validIdList}. 
Do not invent any new ones. If unsure, use 'shelton', 'jolo', or 'raffaldini'.`
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const retryResponse = retryCompletion.choices[0]?.message?.content;
      if (retryResponse) {
        let retryParsed;
        try {
          retryParsed = JSON.parse(retryResponse);
        } catch (e) {
          console.error('Failed to parse retry response as JSON');
        }

        if (retryParsed) {
          const retryValidated = AITrailResponseSchema.parse(retryParsed);
          const retryInvalidIds = validateWineryIds(retryValidated);
          
          if (retryInvalidIds.length === 0) {
            validated = retryValidated;
          }
        }
      }
    }

    // Final save to DB — always use short ID
    let trailId: string;
    const metadata = {
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: 
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        undefined
    };

    try {
      trailId = await saveTrail(input, validated, metadata);
      console.log('Trail saved to database with ID:', trailId);
    } catch (dbError) {
      console.error('Database save failed, using generated short ID:', dbError);
      trailId = nanoid();
    }

    return NextResponse.json({
      ...validated,
      id: trailId
    });

  } catch (error) {
    console.error('Trail generation error:', error);

    const fallback = getFallbackTrail(parseInt(input?.stops || '3'));
    let trailId: string;

    const metadata = {
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: 
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        undefined
    };

    try {
      trailId = await saveTrail(input, fallback, metadata);
    } catch (dbError) {
      trailId = nanoid();
    }

    return NextResponse.json({
      ...fallback,
      id: trailId
    });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    wineries: WINERIES.length,
    hasApiKey: !!process.env.GROQ_API_KEY
  });
}