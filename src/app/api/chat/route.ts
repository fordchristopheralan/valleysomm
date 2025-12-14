import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('[/api/chat] Raw body received:', JSON.stringify(body));

    let messages;

    if (Array.isArray(body)) {
      messages = body;
    } else if (body && Array.isArray(body.messages)) {
      messages = body.messages;
    } else {
      console.error('Invalid payload structure:', body);
      return new Response('Invalid request: messages array missing', { status: 400 });
    }

    console.log('[/api/chat] Using messages:', JSON.stringify(messages));

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages, // Direct plain messages — no conversion needed
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const err = error as Error;
    console.error('[/api/chat] Full error:', err);
    console.error('Stack:', err.stack);
    return new Response(`Error: ${err.message || 'Unknown error'}`, { status: 500 });
  }
}