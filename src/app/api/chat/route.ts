import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('[/api/chat] Raw body received:', body); // ← This will show exactly what is sent

    let rawMessages;

    if (Array.isArray(body)) {
      rawMessages = body;
    } else if (body && Array.isArray(body.messages)) {
      rawMessages = body.messages;
    } else {
      console.error('Invalid payload structure:', body);
      return new Response('Invalid request: messages array missing', { status: 400 });
    }

    console.log('[/api/chat] Extracted messages:', rawMessages);

    if (rawMessages.length === 0) {
      rawMessages = []; // safe empty array
    }

    const modelMessages = convertToModelMessages(rawMessages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages: modelMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[/api/chat] Full error:', error);
    console.error('Stack:', error.stack);
    return new Response(`Error: ${(error as Error).message || 'Unknown error'}`, { status: 500 });
  }
}