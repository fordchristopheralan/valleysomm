import { NextRequest, NextResponse } from "next/server";
import { sql, Winery } from "@/lib/db";
import { buildSystemPrompt, chat, ChatMessage, parseAIResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Get all active wineries for the AI's knowledge base
    const wineries = await sql`
      SELECT 
        id, name, slug, description, engaging_description,
        address_city, tasting_fee, google_rating, quality_score,
        wine_styles, varietals, amenities, vibe, best_for,
        reservation_required, phone, website
      FROM wineries 
      WHERE is_active = true
      ORDER BY quality_score DESC
    ` as Winery[];

    // Build system prompt with winery knowledge
    const systemPrompt = buildSystemPrompt(wineries);

    // Prepare message history
    const messages: ChatMessage[] = [
      ...(history || []),
      { role: "user", content: message },
    ];

    // Call Claude
    const { response, extracted } = await chat(messages, systemPrompt);

    // Find wineries mentioned in the response to return as cards
    const mentionedWineryNames = extracted?.recommended_wineries || [];
    const mentionedWineries = wineries.filter((w) =>
      mentionedWineryNames.some(
        (name) => w.name.toLowerCase() === name.toLowerCase()
      ) ||
      // Also check if the winery name appears in the response
      response.toLowerCase().includes(w.name.toLowerCase())
    );

    // Update session with extracted preferences if we have a session
    if (sessionId && extracted?.preferences) {
      try {
        await sql`
          UPDATE sessions 
          SET 
            preferences = ${JSON.stringify(extracted.preferences)}::jsonb,
            last_active_at = NOW()
          WHERE id = ${sessionId}::uuid
        `;
      } catch (e) {
        console.error("Failed to update session:", e);
      }
    }

    // Track the chat event
    if (sessionId) {
      try {
        await sql`
          INSERT INTO events (session_id, event_type, properties)
          VALUES (
            ${sessionId}::uuid, 
            'chat_message',
            ${JSON.stringify({
              message_length: message.length,
              response_length: response.length,
              wineries_mentioned: mentionedWineries.map((w) => w.name),
              extracted_confidence: extracted?.confidence,
            })}::jsonb
          )
        `;
      } catch (e) {
        console.error("Failed to track event:", e);
      }
    }

    // Save to conversations table
    if (sessionId) {
      try {
        // Check if conversation exists
        const existing = await sql`
          SELECT id, messages FROM conversations 
          WHERE session_id = ${sessionId}::uuid
          LIMIT 1
        `;

        if (existing.length > 0) {
          // Update existing conversation
          const existingMessages = existing[0].messages || [];
          await sql`
            UPDATE conversations 
            SET 
              messages = ${JSON.stringify([
                ...existingMessages,
                { role: "user", content: message, timestamp: new Date().toISOString() },
                { role: "assistant", content: response, timestamp: new Date().toISOString() },
              ])}::jsonb,
              extracted_preferences = ${JSON.stringify(extracted?.preferences || null)}::jsonb,
              updated_at = NOW()
            WHERE session_id = ${sessionId}::uuid
          `;
        } else {
          // Create new conversation
          await sql`
            INSERT INTO conversations (session_id, messages, extracted_preferences)
            VALUES (
              ${sessionId}::uuid,
              ${JSON.stringify([
                { role: "user", content: message, timestamp: new Date().toISOString() },
                { role: "assistant", content: response, timestamp: new Date().toISOString() },
              ])}::jsonb,
              ${JSON.stringify(extracted?.preferences || null)}::jsonb
            )
          `;
        }
      } catch (e) {
        console.error("Failed to save conversation:", e);
      }
    }

    return NextResponse.json({
      message: response,
      wineries: mentionedWineries.slice(0, 6).map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        address_city: w.address_city,
        tasting_fee: w.tasting_fee,
        google_rating: w.google_rating,
        quality_score: w.quality_score,
        wine_styles: w.wine_styles,
        amenities: w.amenities,
        vibe: w.vibe,
      })),
      extracted,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
