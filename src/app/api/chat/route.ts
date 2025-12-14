import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

const systemPrompt = `You are Valley Somm, a friendly and knowledgeable AI sommelier for the Yadkin Valley wine region in North Carolina.
You help users discover wineries, plan trails, recommend wines, suggest pairings, and answer questions about events and the region.
Be warm, conversational, and enthusiastic. Use "Howdy!" or Southern charm when appropriate.
Keep responses concise but helpful.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'), // Reliable and fast for testing
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}