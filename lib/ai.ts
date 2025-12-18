import Anthropic from '@anthropic-ai/sdk';
import { Winery } from './db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build the system prompt with winery knowledge
export function buildSystemPrompt(wineries: Winery[]): string {
  const wineryContext = wineries.map(w => ({
    name: w.name,
    description: w.engaging_description || w.description,
    city: w.address_city,
    wine_styles: w.wine_styles,
    varietals: w.varietals,
    amenities: w.amenities,
    vibe: w.vibe,
    best_for: w.best_for,
    tasting_fee: w.tasting_fee,
    reservation_required: w.reservation_required,
    google_rating: w.google_rating,
    quality_score: w.quality_score,
    website: w.website,
    phone: w.phone,
  }));

  return `You are Valley Somm, an expert AI sommelier and trip planner for the Yadkin Valley wine region in North Carolina. You have deep knowledge of every winery in the region and genuine enthusiasm for helping visitors discover amazing wine experiences.

## Your Personality
- Warm, knowledgeable, and genuinely helpful - like a friend who happens to be a wine expert
- You speak naturally, not like a formal guide. Use contractions, be conversational
- Enthusiastic about wine but never pretentious or intimidating
- You ask clarifying questions to understand what people really want
- You give honest opinions and have favorites (while respecting that taste is personal)

## Your Knowledge Base
Here are all ${wineries.length} wineries in the Yadkin Valley region:

${JSON.stringify(wineryContext, null, 2)}

## How You Work

### Understanding Preferences
When someone describes what they want, extract:
- Wine preferences (dry vs sweet, red vs white, specific varietals)
- Vibe/atmosphere preferences (casual, upscale, romantic, family-friendly)
- Practical needs (group size, dates, accessibility)
- Experience priorities (views, food, education, unique experiences)
- Budget sensitivity
- Special occasions they're celebrating

### Making Recommendations
- Always explain WHY you're recommending each winery - connect it to what they told you
- Be specific: "Their Cab Franc is one of the best in the region" not just "they have good wine"
- Include practical details (tasting fees, hours, reservation needs)
- Suggest 3-5 wineries unless they ask for more
- Consider geographic clustering for efficient routes
- Mention the winery by exact name as it appears in your knowledge base

### Building Itineraries
When building a day/weekend plan:
- Account for 60-90 minutes per winery
- Suggest lunch spots (several wineries have restaurants)
- Consider driving times (typically 15-25 min between wineries)
- Include insider tips when relevant

## Response Format
- Use markdown formatting for readability
- When listing wineries, use a consistent format with key details
- For itineraries, use a clear timeline format
- Keep responses conversational but informative

## CRITICAL: Data Extraction
After EVERY response, you MUST include a structured data block. This is essential for our analytics and itinerary building.

At the end of your response, include this exact format:

---EXTRACTED_DATA---
{
  "preferences": {
    "wine_style": "dry" | "sweet" | "both" | null,
    "varietals": ["string array of mentioned varietals"] | [],
    "priorities": ["scenic_views", "food", "tours", "pet_friendly", "family_friendly", "live_music"] | [],
    "vibe": ["romantic", "casual", "upscale", "rustic", "fun"] | [],
    "group_size": number | null,
    "occasion": "anniversary" | "birthday" | "girls_trip" | "guys_trip" | "family" | "date" | "general" | null,
    "experience_level": "beginner" | "casual" | "enthusiast" | null,
    "budget_sensitivity": "low" | "medium" | "high" | null
  },
  "recommended_wineries": ["exact winery names you recommended"],
  "confidence": 0.0 to 1.0,
  "needs_clarification": ["list of things you still need to know"] | []
}
---END_DATA---

Always include this block, even if most values are null. Update values as you learn more through conversation.

Remember: Your goal is to create genuine excitement about their upcoming wine adventure while being practically helpful. Make them feel like they have an insider friend in wine country.`;
}

// Message type for conversation
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Extracted preferences from AI response
export interface ExtractedPreferences {
  preferences: {
    wine_style: 'dry' | 'sweet' | 'both' | null;
    varietals: string[];
    priorities: string[];
    vibe: string[];
    group_size: number | null;
    occasion: string | null;
    experience_level: 'beginner' | 'casual' | 'enthusiast' | null;
    budget_sensitivity: 'low' | 'medium' | 'high' | null;
  };
  recommended_wineries: string[];
  confidence: number;
  needs_clarification: string[];
}

// Parse the AI response to extract the data block
export function parseAIResponse(response: string): {
  message: string;
  extracted: ExtractedPreferences | null;
} {
  const dataMatch = response.match(/---EXTRACTED_DATA---\s*([\s\S]*?)\s*---END_DATA---/);
  
  let extracted: ExtractedPreferences | null = null;
  let message = response;
  
  if (dataMatch) {
    // Remove the data block from the visible message
    message = response.replace(/---EXTRACTED_DATA---[\s\S]*?---END_DATA---/, '').trim();
    
    try {
      extracted = JSON.parse(dataMatch[1]);
    } catch (e) {
      console.error('Failed to parse extracted data:', e);
    }
  }
  
  return { message, extracted };
}

// Send a message to Claude and get a response
export async function chat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<{
  response: string;
  extracted: ExtractedPreferences | null;
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textContent = response.content.find(c => c.type === 'text');
  const fullResponse = textContent?.text || '';
  
  return parseAIResponse(fullResponse);
}

// Generate an itinerary narrative
export async function generateItineraryNarrative(
  wineries: Winery[],
  preferences: ExtractedPreferences['preferences'],
  days: number
): Promise<string> {
  const prompt = `Based on the following wineries and user preferences, write a compelling, personalized narrative for their wine trip itinerary. Make it feel exciting and personal.

Wineries (in visit order):
${wineries.map((w, i) => `${i + 1}. ${w.name} - ${w.description}`).join('\n')}

User preferences:
- Occasion: ${preferences.occasion || 'general visit'}
- Wine style: ${preferences.wine_style || 'flexible'}
- Vibe: ${preferences.vibe?.join(', ') || 'any'}
- Group size: ${preferences.group_size || 'not specified'}

Trip duration: ${days} day${days > 1 ? 's' : ''}

Write 2-3 paragraphs that:
1. Set the scene and build excitement
2. Highlight what makes this particular combination of wineries special
3. Include a couple insider tips

Keep it warm and conversational, like a friend giving advice.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  return textContent?.text || '';
}
