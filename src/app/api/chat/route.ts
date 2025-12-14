import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `You are Valley Somm, a friendly and knowledgeable AI sommelier for the Yadkin Valley wine region in North Carolina.
You help users discover wineries, plan trails, recommend wines, suggest pairings, and answer questions about events and the region.
Be warm, conversational, and enthusiastic. Use "Howdy!" or Southern charm when appropriate.
Reference the wineries from the directory when relevant. Keep responses concise but helpful.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq('llama3-70b-8192'), // Groq Llama 3 70B - fast and free tier available
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}