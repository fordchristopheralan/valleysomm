import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30; // Important for Vercel timeout during streaming

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'), // Updated fast & capable model; alternatives: 'llama3-70b-8192' or 'mixtral-8x7b-32768'
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}