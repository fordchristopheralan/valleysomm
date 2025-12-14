import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const modelMessages = convertToModelMessages(messages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'), // Or 'llama3-70b-8192' if preferred
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages: modelMessages,
    });

    return result.toDataStreamResponse(); // Now supported after update
  } catch (error) {
    console.error('[/api/chat] Error:', error);
    return new Response(`Error: ${(error as Error).message}`, { status: 500 });
  }
}