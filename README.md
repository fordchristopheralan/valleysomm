# Valley Somm

AI-powered wine trip planning for North Carolina's Yadkin Valley wine region!

## Features

- 🤖 **AI Sommelier** - Chat naturally with Claude to plan your wine trip
- 🍷 **50+ Wineries** - Complete database of Yadkin Valley wineries
- 📍 **Smart Itineraries** - Save and share your personalized trip plans
- 📊 **Analytics** - Track user behavior and preferences

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **AI**: Anthropic Claude API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/valley-somm.git
cd valley-somm
npm install
```

### 2. Set Up Neon Database

1. Create a new project at [console.neon.tech](https://console.neon.tech)
2. Copy your connection string
3. Run the schema in the Neon SQL Editor:

```bash
# Copy contents of db/schema.sql and run in Neon SQL Editor
```

4. Seed the winery data:

```bash
# Copy contents of db/seed.sql and run in Neon SQL Editor
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/valley_somm?sslmode=require"
ANTHROPIC_API_KEY="sk-ant-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL` - Your Neon connection string
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://valley-somm.vercel.app`)

### 3. Deploy

Vercel will automatically deploy on every push to `main`.

## Project Structure

```
valley-somm/
├── app/
│   ├── api/
│   │   ├── chat/          # AI conversation endpoint
│   │   ├── itinerary/     # Itinerary CRUD
│   │   ├── sessions/      # Session management
│   │   └── wineries/      # Winery data
│   ├── chat/              # Main AI chat interface
│   ├── itinerary/[token]/ # Shareable itinerary view
│   ├── wineries/          # Winery listing & details
│   ├── layout.tsx
│   ├── page.tsx           # Landing page
│   └── globals.css
├── components/            # Reusable UI components
├── lib/
│   ├── db.ts             # Database connection
│   ├── ai.ts             # Claude API helpers
│   └── utils.ts          # Utility functions
├── db/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Winery seed data
└── public/
```

## Database Schema

### Tables

- **wineries** - All winery data (50 records)
- **sessions** - Anonymous user sessions
- **itineraries** - Saved trip plans
- **conversations** - Chat history with AI
- **events** - Analytics tracking

### Key Analytics Queries

```sql
-- Sessions by input mode
SELECT input_mode, COUNT(*) 
FROM sessions 
GROUP BY input_mode;

-- Popular wineries in itineraries
SELECT w.name, COUNT(*) as times_added
FROM itineraries i, 
     jsonb_array_elements(i.wineries) as iw,
     wineries w
WHERE w.id = (iw->>'winery_id')::uuid
GROUP BY w.name
ORDER BY times_added DESC;

-- Chat engagement
SELECT 
  DATE_TRUNC('day', timestamp) as day,
  COUNT(*) as messages
FROM events
WHERE event_type = 'chat_message'
GROUP BY day
ORDER BY day DESC;
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | POST | Create anonymous session |
| `/api/chat` | POST | Send message to AI |
| `/api/wineries` | GET | List all wineries |
| `/api/itinerary` | POST | Create itinerary |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `ANTHROPIC_API_KEY` | Claude API key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for share links | Yes |

## Development

```bash
# Run dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## License

MIT
