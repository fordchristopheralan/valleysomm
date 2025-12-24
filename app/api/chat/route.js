import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { getCurrentStep, parseUserResponse, shouldTriggerItinerary } from '@/lib/chatFlow'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const systemPrompt = `You are a friendly, knowledgeable wine sommelier helping users plan their Yadkin Valley wine trip. 

Your personality:
- Conversational and warm, like chatting with a wine-loving friend
- Expert but not pretentious - make wine approachable
- Excited about Yadkin Valley and eager to share hidden gems
- Efficient - get the info you need without over-explaining

Your job:
- Guide users through 7 steps to understand their preferences
- Ask ONE question at a time, keep it conversational
- If they give vague answers, ask clarifying follow-ups
- Extract structured data: dates, group size, wine preferences, vibe, logistics
- When you have enough info, generate a personalized itinerary

Conversation flow:
1. When are they visiting? (dates/timeframe)
2. How many people? (group size/composition)
3. Wine preferences (dry/sweet, red/white/rosé, adventurous/classic)
4. What vibe? (romantic/social, educational/relaxed, scenic views)
5. Logistics (reservation comfort, drive time limits, budget concerns)
6. Transportation (have DD, need help, interested in tours/shuttles)
7. Add-ons (food, lodging, non-wine activities)

After gathering enough information (typically 6-7 steps complete), generate a DETAILED itinerary with:
- Specific winery names (real Yadkin Valley wineries like Shelton, Raylen, Divine Llama, Stony Knoll, RagApple Lassie, etc.)
- Timing for each stop (e.g., "10:30 AM", "12:30 PM")
- Why each winery fits their preferences
- Phone numbers for reservations
- Practical tips (drive times, pro tips)
- Lunch recommendations if requested

Format the itinerary in a clear, readable way with headers like:
**Morning (10:30 AM):** Winery name - Description
**Lunch (12:30 PM):** Restaurant/winery - Description
**Afternoon (2:30 PM):** Winery name - Description

Keep responses under 3 sentences UNLESS you're generating the final itinerary.
Use casual language: "Awesome!" "Perfect!" "Great choice!"
Never use bullet points in conversation - keep it flowing naturally.
When generating the itinerary, be detailed and specific.`

export async function POST(request) {
  try {
    const { messages, conversationData = {} } = await request.json()

    // Build conversation history for Claude
    const claudeMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    let assistantMessage = ''

    try {
      // Try Claude first
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048, // Increased for longer itineraries
        system: systemPrompt,
        messages: claudeMessages
      })

      assistantMessage = response.content[0].text

    } catch (claudeError) {
      console.error('Claude API error, falling back to Groq:', claudeError)

      // Fallback to Groq
      const groqResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...claudeMessages
        ],
        max_tokens: 2048,
        temperature: 0.7
      })

      assistantMessage = groqResponse.choices[0].message.content
    }

    // Parse the latest user response to update conversation data
    const latestUserMessage = messages[messages.length - 1]?.content || ''
    const updatedConversationData = parseUserResponse(
      latestUserMessage,
      conversationData
    )

    // Check if we should generate itinerary BEFORE updating step
    const shouldGenerate = shouldTriggerItinerary(updatedConversationData)
    
    // **FIX #3**: Mark as triggered to prevent duplicate generation messages
    if (shouldGenerate && !updatedConversationData.itineraryTriggered) {
      updatedConversationData.itineraryTriggered = true
    }

    // Determine current step AFTER checking trigger
    const currentStep = getCurrentStep(updatedConversationData)
    updatedConversationData.currentStep = currentStep

    return NextResponse.json({
      message: assistantMessage,
      conversationData: updatedConversationData,
      shouldGenerateItinerary: shouldGenerate
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}