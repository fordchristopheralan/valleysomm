import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  // ←←← Put these logs here (very top of POST)
  console.log('[/api/chat] Route invoked at:', new Date().toISOString());
  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
  console.log('GROQ_API_KEY preview (first 5 chars):', process.env.GROQ_API_KEY?.slice(0, 5) || 'undefined');

  try {
    const { messages } = await req.json();
    console.log('Received messages count:', messages.length); // Optional: confirm payload

    const modelMessages = convertToModelMessages(messages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages: modelMessages,
    });

    console.log('Streaming response started'); // This will only appear if key is valid
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[/api/chat] Error:', error);
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
}