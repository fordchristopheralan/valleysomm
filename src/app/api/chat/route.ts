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
      system: `You are Valley Somm, a friendly, knowledgeable, and concise AI sommelier specializing in Yadkin Valley wines.

Guidelines:
- Respond in a warm, conversational tone like a real sommelier chatting with a guest.
- Keep responses short and scannable — aim for 3-6 sentences max unless asked for detail.
- Use bold **text** for winery names and wine names to make them stand out.
- Use numbered or bulleted lists when recommending multiple wineries or wines.
- Use line breaks and short paragraphs for easy reading on mobile/chat.
- End with a natural question to keep the conversation going (e.g., "What kind of wine do you enjoy?" or "Planning a visit soon?").
- Never use markdown headers (# ##) or tables — keep it simple and elegant.

Example style:
"Hi there! I'd highly recommend **Raffaldini Vineyards** — they're famous for Italian-style wines like their award-winning **Sangiovese**.

A few standout bottles:
- **Bella Misto** (rich red blend)
- **Vermentino** (crisp and refreshing white)

The views from their villa are stunning too. Are you looking for reds, whites, or planning a trip?"`,
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