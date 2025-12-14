import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { WINERIES } from '@/lib/wineries';
import { AIInputSchema, AITrailResponseSchema } from '@/lib/schema';
import type { AIInput, AITrailResponse } from '@/lib/types';

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
  return `Visitor preferences:
- Vibe: ${input.vibe}
- Wine preferences: ${input.winePreferences.join(', ')}
- Group type: ${input.groupType}
- Number of stops: ${input.stops}
- Traveling from: ${input.originCity}
${input.dislikes ? `- Dislikes: ${input.dislikes}` : ''}

Available wineries:
${JSON.stringify(WINERIES, null, 2)}

Requirements:
- Choose exactly ${input.stops} wineries from the dataset above
- Optimize for minimal driving distance
- Match the requested vibe and wine preferences
- Suggest a logical visit order (morning to evening)
- Use friendly, non-technical language
- Provide specific arrival times (e.g., "11:00 AM", "1:30 PM")
- For each winery, explain WHY it fits their preferences

Return JSON only matching this exact structure:
{
  "trailName": "Creative name for the trail (e.g., 'Mountain View Wine Adventure')",
  "summary": "2-3 sentence overview of the day",
  "totalStops": ${input.stops},
  "estimatedDurationHours": ${input.stops + 1},
  "wineries": [
    {
      "wineryId": "exact ID from dataset (e.g., 'jolo')",
      "order": 1,
      "whyItsIncluded": "Specific reason matching their preferences",
      "suggestedArrivalTime": "Time in format like '11:00 AM'",
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
    {
      wineryId: 'divine-llama',
      order: 4,
      whyItsIncluded: 'Fun llama experience adds memorable charm to your wine trail',
      suggestedArrivalTime: '4:30 PM',
      whatToTry: 'Rosé and Muscadine'
    },
    {
      wineryId: 'round-peak',
      order: 5,
      whyItsIncluded: 'Mountain vistas provide a perfect ending with peaceful scenery',
      suggestedArrivalTime: '6:00 PM',
      whatToTry: 'Cabernet Franc and Syrah'
    }
  ];

  return {
    trailName: 'Yadkin Valley Classics',
    summary: 'A carefully curated trail featuring the region\'s most beloved wineries, from educational estates to scenic mountain views.',
    totalStops: stops,
    estimatedDurationHours: stops + 1,
    wineries: fallbackWineries.slice(0, stops)
  };
}

// Validate winery IDs exist in dataset
function validateWineryIds(trail: AITrailResponse): string[] {
  const validIds = new Set(WINERIES.map(w => w.id));
  return trail.wineries
    .map(w => w.wineryId)
    .filter(id => !validIds.has(id));
}

// Main POST handler
export async function POST(request: Request) {
  try {
    // Parse and validate input
    const body = await request.json();
    const input = AIInputSchema.parse(body);

    console.log('Generating trail for:', input);

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input) }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const rawResponse = completion.choices[0]?.message?.content;
    
    if (!rawResponse) {
      console.error('No response from AI');
      return NextResponse.json(getFallbackTrail(input.stops));
    }

    // Parse and validate AI response
    const parsed = JSON.parse(rawResponse);
    const validated = AITrailResponseSchema.parse(parsed);

    // Verify all wineries exist in dataset
    const invalidIds = validateWineryIds(validated);
    
    if (invalidIds.length > 0) {
      console.error('AI returned invalid winery IDs:', invalidIds);
      // Retry once with more explicit instructions
      const retryCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: buildUserPrompt(input) + '\n\nIMPORTANT: Only use winery IDs that appear in the dataset above. Do not make up IDs.' 
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const retryResponse = retryCompletion.choices[0]?.message?.content;
      if (retryResponse) {
        const retryParsed = JSON.parse(retryResponse);
        const retryValidated = AITrailResponseSchema.parse(retryParsed);
        const retryInvalidIds = validateWineryIds(retryValidated);
        
        if (retryInvalidIds.length === 0) {
          return NextResponse.json(retryValidated);
        }
      }
      
      // Both attempts failed, return fallback
      return NextResponse.json(getFallbackTrail(input.stops));
    }

    // Success!
    return NextResponse.json(validated);

  } catch (error) {
    console.error('Trail generation error:', error);
    
    // Return fallback on any error
    const fallbackStops = 3; // Default fallback
    return NextResponse.json(getFallbackTrail(fallbackStops), {
      status: 200 // Still return 200 to avoid breaking UX
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    wineries: WINERIES.length,
    hasApiKey: !!process.env.GROQ_API_KEY
  });
}