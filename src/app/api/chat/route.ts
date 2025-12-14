import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30; // Allows longer streaming on Vercel

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'), // Fast, capable model; fallback: 'llama3-70b-8192' if needed
      system: 'You are a knowledgeable, friendly sommelier specializing in Yadkin Valley wines. Provide helpful recommendations, winery info, pairings, and trail suggestions.',
      messages,
    });

    return result.toTextStreamResponse(); // This is the correct method for your SDK version
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}