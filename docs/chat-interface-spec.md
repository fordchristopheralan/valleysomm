# ValleySomm AI Chat Interface Specification

## Overview

This document specifies the UI/UX requirements for the conversational AI trip planner—the core feature of ValleySomm. Users chat with an AI sommelier to create personalized wine country itineraries.

---

## Design Principles

1. **Conversational, not transactional** — Feel like chatting with a knowledgeable friend
2. **Mobile-first** — 70%+ of users will be on phones
3. **Progressive disclosure** — Gather information naturally, not all at once
4. **Delightful details** — Wine-themed personality, not corporate chatbot
5. **Clear outcomes** — Every conversation ends with a shareable itinerary

---

## User Journey

### Entry Points
1. **Homepage CTA** — "Plan Your Wine Day"
2. **Direct link** — valleysomm.com/plan
3. **Winery page** — "Include this winery in my trip"
4. **Returning user** — "Continue planning" or "Start new trip"

### Conversation Flow (7 Steps)

```
┌─────────────────────────────────────────┐
│ 1. WELCOME & DATE                       │
│    "When are you visiting?"             │
│    → Quick reply buttons: Today,        │
│      Tomorrow, This Weekend, Pick Date  │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 2. GROUP                                │
│    "Who's joining you?"                 │
│    → Solo, Couple, Small Group (3-6),   │
│      Large Group (7+), Family w/ Kids   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 3. WINE PREFERENCES                     │
│    "What wines do you love?"            │
│    → Multi-select: Dry Reds, Sweet,     │
│      Whites, Sparkling, Rosé,           │
│      "Surprise me!", "Still learning"   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 4. VIBE & ATMOSPHERE                    │
│    "What kind of experience?"           │
│    → Romantic, Educational, Scenic,     │
│      Party Vibe, Quiet & Intimate,      │
│      Family-Friendly, Unique/Quirky     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 5. LOGISTICS                            │
│    "How are you getting around?"        │
│    → Designated driver, Hired driver,   │
│      Uber/Lyft, "Need suggestions"      │
│    + "Any dietary needs for lunch?"     │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 6. SPECIAL REQUESTS (Optional)          │
│    "Anything else I should know?"       │
│    → Free text or skip                  │
│    Examples: "It's her birthday",       │
│    "We loved XYZ winery last time"      │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 7. GENERATE ITINERARY                   │
│    "Creating your perfect wine day..."  │
│    → Loading animation (wine-themed)    │
│    → Reveal itinerary with flourish     │
└─────────────────────────────────────────┘
```

---

## Interface Layouts

### Mobile (Default)

```
┌────────────────────────────────┐
│ ← Back          ValleySomm 🍷  │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐  │
│  │ AI Message              │  │
│  │ "Hi! I'm your AI        │  │
│  │  sommelier. Let's plan  │  │
│  │  an amazing wine day!"  │  │
│  └──────────────────────────┘  │
│                                │
│       ┌──────────────────────┐ │
│       │ Your Response       │ │
│       └──────────────────────┘ │
│                                │
│  ┌──────────────────────────┐  │
│  │ AI Message              │  │
│  │ "When are you visiting  │  │
│  │  Yadkin Valley?"        │  │
│  └──────────────────────────┘  │
│                                │
│  ┌────────┐ ┌────────────────┐ │
│  │ Today  │ │ Tomorrow      │ │
│  └────────┘ └────────────────┘ │
│  ┌─────────────┐ ┌───────────┐ │
│  │ This Weekend│ │ Pick Date │ │
│  └─────────────┘ └───────────┘ │
│                                │
├────────────────────────────────┤
│ Type a message...      [Send] │
└────────────────────────────────┘
```

### Desktop (Split View)

```
┌──────────────────────────────────────────────────────────────────┐
│ ValleySomm — Plan Your Wine Day                          [Login] │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│  CHAT INTERFACE                │  TRIP SUMMARY                   │
│  ─────────────────             │  ─────────────                  │
│                                │                                 │
│  ┌────────────────────────┐    │  📅 Saturday, Jan 18            │
│  │ AI: "Hi! Let's plan    │    │  👥 4 people                    │
│  │ your perfect wine day" │    │  🍷 Dry reds, whites            │
│  └────────────────────────┘    │                                 │
│                                │  ──────────────────────         │
│       ┌────────────────────┐   │                                 │
│       │ You: "This weekend"│   │  YOUR ITINERARY                 │
│       └────────────────────┘   │  (Building...)                  │
│                                │                                 │
│  ┌────────────────────────┐    │  10:00 AM                       │
│  │ AI: "Perfect! Who's    │    │  ┌─────────────────────┐        │
│  │ joining you?"          │    │  │ Round Peak Vineyards│        │
│  └────────────────────────┘    │  │ Dry reds, great views│       │
│                                │  └─────────────────────┘        │
│  ┌─────────┐ ┌─────────┐       │                                 │
│  │ Solo    │ │ Couple  │       │  12:30 PM                       │
│  └─────────┘ └─────────┘       │  ┌─────────────────────┐        │
│  ┌─────────────┐ ┌─────────┐   │  │ 🍽️ Lunch at XYZ     │        │
│  │ Small Group │ │ Large   │   │  └─────────────────────┘        │
│  └─────────────┘ └─────────┘   │                                 │
│                                │  2:00 PM                        │
│  ────────────────────────────  │  ┌─────────────────────┐        │
│  Type a message...    [Send]   │  │ Shelton Vineyards   │        │
│                                │  │ Award-winning whites │        │
│                                │  └─────────────────────┘        │
│                                │                                 │
│                                │  [📍 View Map] [📤 Share]       │
└────────────────────────────────┴─────────────────────────────────┘
```

---

## UI Components

### Message Bubbles

**AI Messages (Left-aligned)**
```css
.ai-message {
  background: linear-gradient(135deg, #FAF7F2, #E8E0D5);
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  max-width: 80%;
  font-family: 'DM Sans', sans-serif;
  color: #2C2C30;
}
```

**User Messages (Right-aligned)**
```css
.user-message {
  background: linear-gradient(135deg, #6B2D3F, #8B3A4D);
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  max-width: 80%;
  color: white;
}
```

### Quick Reply Buttons

```css
.quick-reply {
  display: inline-flex;
  padding: 10px 18px;
  border: 2px solid #6B2D3F;
  border-radius: 24px;
  background: transparent;
  color: #6B2D3F;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-reply:hover {
  background: #6B2D3F;
  color: white;
}

.quick-reply.selected {
  background: #6B2D3F;
  color: white;
}
```

### Multi-Select Options

```css
.multi-select-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #E8E0D5;
  border-radius: 12px;
  margin: 8px 0;
  cursor: pointer;
}

.multi-select-option.selected {
  border-color: #6B2D3F;
  background: rgba(107, 45, 63, 0.05);
}

.multi-select-option .checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #C4637A;
  margin-right: 12px;
}
```

### Loading State (Generating Itinerary)

```
┌──────────────────────────────┐
│                              │
│     🍷                       │
│     ↺ (spinning)             │
│                              │
│  "Crafting your perfect      │
│   wine day..."               │
│                              │
│  ▓▓▓▓▓▓▓░░░░░ 65%           │
│                              │
│  Finding the best matches... │
│                              │
└──────────────────────────────┘
```

---

## Itinerary Card

### Mobile View

```
┌────────────────────────────────┐
│ YOUR WINE DAY                  │
│ Saturday, January 18           │
├────────────────────────────────┤
│                                │
│  10:00 AM ─────────────────    │
│  ┌──────────────────────────┐  │
│  │ 🍷 Round Peak Vineyards  │  │
│  │ ─────────────────────────│  │
│  │ "Elevated wines with     │  │
│  │  breathtaking views"     │  │
│  │                          │  │
│  │ 🍾 Dry Reds • Views      │  │
│  │ 💰 $15 tasting           │  │
│  │ ⏱️ ~60 min              │  │
│  │                          │  │
│  │ [📞 Call] [🌐 Website]   │  │
│  └──────────────────────────┘  │
│           │                    │
│           │ 15 min drive       │
│           ▼                    │
│  12:30 PM ─────────────────    │
│  ┌──────────────────────────┐  │
│  │ 🍽️ Harvest Grill         │  │
│  │ ─────────────────────────│  │
│  │ Farm-to-table lunch spot │  │
│  │ near Shelton Vineyards   │  │
│  └──────────────────────────┘  │
│           │                    │
│           │ 5 min drive        │
│           ▼                    │
│  2:00 PM ──────────────────    │
│  ┌──────────────────────────┐  │
│  │ 🍷 Shelton Vineyards     │  │
│  │ ... (details)            │  │
│  └──────────────────────────┘  │
│           │                    │
│           ▼                    │
│  4:30 PM ──────────────────    │
│  ┌──────────────────────────┐  │
│  │ 🍷 RagApple Lassie       │  │
│  │ ... (details)            │  │
│  └──────────────────────────┘  │
│                                │
├────────────────────────────────┤
│ [📍 Open in Maps]              │
│ [📤 Share Itinerary]           │
│ [✏️ Edit Trip]                 │
└────────────────────────────────┘
```

---

## AI Personality

### Voice & Tone

**Do:**
- Be warm and enthusiastic ("I love this one!")
- Use wine-adjacent language naturally ("This pairs well with...")
- Share insider tips ("Pro tip: ask for the reserve list")
- Acknowledge preferences ("Since you love dry reds...")
- Be concise but not robotic

**Don't:**
- Be overly formal ("I shall now present...")
- Use excessive emojis (one or two max per message)
- Be pushy about upgrades or premium features
- Make assumptions about budget or experience
- Use wine jargon without explanation

### Example Messages

**Opening:**
> "Hey there! 🍷 I'm your AI sommelier for Yadkin Valley. Let's plan an amazing wine day—I know all 50+ wineries and I'll match you with the perfect ones. When are you visiting?"

**After collecting preferences:**
> "Nice! A couple looking for romantic spots with dry reds and scenic views... I know exactly where to send you. One quick question—how are you getting around? I want to plan a route that makes sense."

**Presenting itinerary:**
> "Here's your perfect wine day! I picked wineries with the best Cabernet Francs and sunset views. Round Peak first for the morning light, Shelton for a long lunch, then RagApple for their famous rosé terrace. Total drive time: just 35 minutes."

**Handling edge cases:**
> "Hmm, that's a large group! Some wineries require advance reservations for 8+. Want me to prioritize places that can accommodate everyone, or would you consider splitting up for a stop or two?"

---

## Error States

### No Wineries Available
```
"Oops! It looks like most wineries are closed on 
Tuesdays. Would you like to pick a different day?"

[Try Another Day] [See Limited Options]
```

### AI Timeout
```
"Taking a bit longer than usual... Let me try 
again. (Sometimes the sommelier needs another 
sip to think clearly! 🍷)"

[Retry] [Start Over]
```

### Network Error
```
"Looks like we lost connection. Your progress is 
saved—let's pick up where we left off."

[Reconnect]
```

---

## Accessibility

1. **Screen readers:** All buttons have aria-labels
2. **Keyboard navigation:** Full chat usable via Tab/Enter
3. **Color contrast:** All text meets WCAG AA standards
4. **Reduce motion:** Respect `prefers-reduced-motion`
5. **Text scaling:** UI works at 200% zoom

---

## Analytics Events

Track these events for optimization:

| Event | Description |
|-------|-------------|
| `chat_started` | User initiates conversation |
| `step_completed` | User answers a question |
| `step_skipped` | User skips optional step |
| `quick_reply_used` | User clicks quick reply vs. typing |
| `itinerary_generated` | Successfully created trip |
| `itinerary_shared` | User shares via link/social |
| `itinerary_saved` | User saves to account |
| `winery_clicked` | User clicks winery in results |
| `map_opened` | User views map of route |
| `chat_abandoned` | User leaves without completing |

---

## Technical Implementation

### API Structure

```typescript
// Chat message
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  multiSelect?: MultiSelectOption[];
}

// Quick reply option
interface QuickReply {
  id: string;
  label: string;
  value: string;
}

// Conversation state
interface ConversationState {
  sessionId: string;
  step: number;
  answers: {
    date?: string;
    groupType?: string;
    winePreferences?: string[];
    vibePreferences?: string[];
    transportation?: string;
    specialRequests?: string;
  };
  itinerary?: Itinerary;
}
```

### Streaming Response

Use Server-Sent Events for real-time AI responses:

```javascript
const eventSource = new EventSource('/api/chat/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  appendToChat(data.content);
};
```

---

## Future Features

1. **Voice input** — "Plan a trip for 4 this Saturday"
2. **Photo-based preferences** — "I want something like this" 📷
3. **Collaborative planning** — Share link, friends add preferences
4. **Calendar integration** — Add itinerary to Google/Apple Calendar
5. **Real-time availability** — Check winery reservations live
6. **Post-trip rating** — "How was Round Peak?" → improves AI
