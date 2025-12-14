import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai'; // Add convertToModelMessages

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert UI messages (with parts) to model messages (with content)
    const modelMessages = convertToModelMessages(messages);

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'), // Reliable model; fallback to 'llama3-70b-8192' if needed
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages: modelMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Groq error:', error);
    return new Response('Error generating response', { status: 500 });
  }
}