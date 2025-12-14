import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const modelMessages = convertToModelMessages(messages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages: modelMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[/api/chat] Error:', error);
    return new Response(`Error: ${(error as Error).message || 'Unknown error'}`, { status: 500 });
  }
}