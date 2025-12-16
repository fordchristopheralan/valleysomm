# 🍷 Valley Somm

> AI-powered wine trail planner for North Carolina’s Yadkin Valley

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://valleysomm.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

**Valley Somm** helps wine lovers create personalized wine trails through Yadkin Valley in under 2 minutes. Answer 5 quick questions, and our AI sommelier generates a custom itinerary matching your taste preferences, group size, and schedule.

![Valley Somm Hero](https://valleysomm.vercel.app/hero.jpg)

-----

## ✨ Features

### 🤖 AI-Powered Recommendations

- Smart matching algorithm using Groq/Llama 3.1
- Personalized winery selection based on preferences
- Optimized route planning for minimal drive time
- Specific wine recommendations at each stop

### 📱 Seamless User Experience

- 5-question interactive quiz (< 2 minutes)
- Beautiful animations and progress tracking
- No signup required
- Mobile-first, responsive design

### 🗺️ Interactive Trail Maps

- Visual route display with Leaflet maps
- Turn-by-turn winery sequence
- Suggested arrival times
- Distance and duration estimates

### 🔗 Shareable Trails

- Unique short URLs for each trail
- Share via social media or direct link
- Trails persist in database
- View count and analytics tracking

### 📊 Built-in Analytics

- Conversion funnel tracking
- Quiz abandonment monitoring
- Trail popularity metrics
- User behavior insights

-----

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Groq API key ([Get one free](https://console.groq.com))
- Neon database account ([Sign up free](https://neon.tech))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/fordchristopheralan/valleysomm.git
cd valleysomm
```

1. **Install dependencies**

```bash
npm install
```

1. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# AI Generation (Required)
GROQ_API_KEY=your_groq_api_key_here

# Database (Required)
DATABASE_URL=your_neon_postgres_connection_string

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

1. **Set up the database**

Run the schema creation script in your Neon SQL Editor:

```sql
-- Create trails table
CREATE TABLE trails (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vibe TEXT NOT NULL,
  wine_preferences TEXT[] NOT NULL,
  group_type TEXT NOT NULL,
  stops INTEGER NOT NULL,
  origin_city TEXT NOT NULL,
  special_requests TEXT,
  occasion TEXT,
  trail_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL,
  wineries JSONB NOT NULL,
  view_count INTEGER DEFAULT 0,
  shared_count INTEGER DEFAULT 0,
  was_shared BOOLEAN DEFAULT FALSE,
  last_viewed_at TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT
);

-- Create trail_views table
CREATE TABLE trail_views (
  id SERIAL PRIMARY KEY,
  trail_id TEXT REFERENCES trails(id),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT
);

-- Create trail_feedback table
CREATE TABLE trail_feedback (
  id SERIAL PRIMARY KEY,
  trail_id TEXT REFERENCES trails(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_trails_created_at ON trails(created_at);
CREATE INDEX idx_trails_view_count ON trails(view_count);
CREATE INDEX idx_trail_views_trail_id ON trail_views(trail_id);
```

1. **Run the development server**

```bash
npm run dev
```

1. **Open your browser**
   Navigate to <http://localhost:3000>

-----

## 🏗️ Tech Stack

### Core Framework

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - UI library

### AI & Backend

- **[Groq SDK](https://console.groq.com/)** - Fast LLM inference (Llama 3.1)
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL database
- **[Zod](https://zod.dev/)** - Schema validation

### UI & Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[Leaflet](https://leafletjs.com/)** - Interactive maps
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon set

### Utilities

- **[nanoid](https://github.com/ai/nanoid)** - Unique ID generation
- **[date-fns](https://date-fns.org/)** - Date manipulation

-----

## 📁 Project Structure

```
valleysomm/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── chat/             # AI chat endpoint
│   │   │   ├── generate-trail/   # Main trail generation
│   │   │   ├── trails/           # Trail CRUD operations
│   │   │   └── analytics/        # Analytics tracking
│   │   ├── trails/[id]/          # Dynamic trail pages
│   │   ├── dashboard/            # Admin dashboard (WIP)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Homepage
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # React components
│   │   ├── Questionnaire.tsx    # 5-question quiz
│   │   ├── TrailResults.tsx     # Trail display
│   │   ├── WineryMap.tsx        # Leaflet map integration
│   │   ├── Chatbot.tsx          # AI chat interface
│   │   └── ...
│   │
│   ├── lib/                      # Utilities & helpers
│   │   ├── db/                   # Database logic
│   │   │   └── trails.ts         # Trail operations
│   │   ├── types.ts              # TypeScript types
│   │   ├── schema.ts             # Zod schemas
│   │   ├── wineries.ts           # Winery data
│   │   └── db.ts                 # DB client
│   │
│   └── data/                     # Static data
│       └── wineries.ts           # Winery information
│
├── public/                       # Static assets
│   ├── hero.jpg
│   └── ...
│
└── Configuration files
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

-----

## 🎯 How It Works

### 1. User Takes Quiz

Five quick questions about:

- Wine tasting vibe (elegant, casual, scenic, educational)
- Wine preferences (reds, whites, sweet, rosé, variety)
- Group composition (couple, friends, family, large group)
- Number of stops (3-5 wineries)
- Origin city (Charlotte, Winston-Salem, Greensboro, Raleigh)

### 2. AI Generates Trail

```typescript
// Simplified flow
const userInput = { vibe, winePreferences, groupType, stops, originCity };

// AI analyzes 30+ wineries and creates optimal trail
const trail = await groq.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  messages: [
    { role: 'system', content: SOMMELIER_PROMPT },
    { role: 'user', content: buildUserPrompt(userInput) }
  ]
});

// Validate winery IDs and save to database
const validatedTrail = validateAndSave(trail);
```

### 3. Trail Display

- Interactive map with markers
- Winery details and recommendations
- Suggested arrival times
- Share buttons
- Unique shareable URL

### 4. Analytics Tracking

- Quiz completion rate
- Popular winery combinations
- Trail views and shares
- Geographic distribution

-----

## 🗺️ About Yadkin Valley

The [Yadkin Valley AVA](https://en.wikipedia.org/wiki/Yadkin_Valley_AVA) is North Carolina’s first federally recognized wine region (established 2003), featuring:

- **50+ wineries** across 7 counties
- **1.4 million acres** of wine country
- **Diverse varietals**: Cabernet Franc, Viognier, Petit Manseng, Chambourcin, and more
- **Unique terroir**: Red clay soil and temperate climate similar to Burgundy
- **Rich history**: Former tobacco country transformed into premier wine destination

-----

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Fork the repository**
1. **Create a feature branch**
   
   ```bash
   git checkout -b feature/amazing-feature
   ```
1. **Make your changes**
- Follow existing code style
- Add TypeScript types
- Test thoroughly
1. **Commit your changes**
   
   ```bash
   git commit -m 'Add amazing feature'
   ```
1. **Push to the branch**
   
   ```bash
   git push origin feature/amazing-feature
   ```
1. **Open a Pull Request**

### Code Style

- Use TypeScript strict mode
- Follow Next.js best practices
- Write meaningful commit messages
- Add comments for complex logic

-----

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Build for production
npm run build
```

-----

## 📊 Analytics & Monitoring

The app tracks several key metrics:

- **Conversion Funnel**
  - Quiz starts
  - Completion by step
  - Abandonment rate
  - Successful trail generations
- **Trail Performance**
  - Most popular wineries
  - Common preferences
  - Share rate
  - View count
- **Technical Metrics**
  - API response times
  - Error rates
  - Database performance

-----

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
1. **Import to Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your repository
- Add environment variables
1. **Deploy!**

### Environment Variables in Vercel

Add these in Project Settings → Environment Variables:

```
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Custom Domain Setup

1. Add domain in Vercel dashboard
1. Update DNS records
1. SSL automatically configured

-----

## 📈 Roadmap

### ✅ Completed

- [x] AI trail generation
- [x] Interactive questionnaire
- [x] Database persistence
- [x] Shareable URLs
- [x] Analytics tracking
- [x] Leaflet maps

### 🚧 In Progress

- [ ] Admin dashboard
- [ ] User accounts
- [ ] Saved trails
- [ ] Email notifications

### 🔮 Future Features

- [ ] Premium winery listings
- [ ] Mobile app (React Native)
- [ ] Wine education content
- [ ] Event calendar integration
- [ ] Hotel/restaurant partnerships
- [ ] Multi-region support
- [ ] Offline mode
- [ ] AR wine label scanner

-----

## 💼 Business Model

### Current: 100% Free

Building user base and proving value proposition

### Future Revenue Streams

1. **Winery Partnerships** - Premium listings and analytics ($50-200/mo)
1. **Premium Features** - Advanced trails, offline maps ($4.99/mo)
1. **Affiliate Revenue** - Hotels, transportation, wine sales
1. **Event Ticketing** - Commission on bookings

-----

## 🐛 Known Issues

See [Issues](https://github.com/fordchristopheralan/valleysomm/issues) for a complete list.

### High Priority

- [ ] Add comprehensive error boundaries
- [ ] Implement API rate limiting
- [ ] Add request timeouts

### Medium Priority

- [ ] Improve mobile map UX
- [ ] Add dark mode
- [ ] Accessibility improvements

-----

## 📄 License

This project is licensed under the MIT License - see the <LICENSE> file for details.

-----

## 🙏 Acknowledgments

- **Yadkin Valley Wineries** - For creating amazing wines
- **North Carolina Wine Industry** - For inspiration and support
- **Groq** - For fast AI inference
- **Neon** - For excellent serverless PostgreSQL
- **Vercel** - For seamless deployment
- **Open Source Community** - For incredible tools

-----

## 📧 Contact

**Christopher Ford**

- GitHub: [@fordchristopheralan](https://github.com/fordchristopheralan)
- Project: <https://github.com/fordchristopheralan/valleysomm>
- Live Demo: <https://valleysomm.vercel.app>

-----

## 🌟 Support

If you find this project helpful:

- ⭐ Star this repository
- 🍷 Share with wine-loving friends
- 🐛 Report bugs
- 💡 Suggest features
- 🤝 Contribute code

-----

<div align="center">

**Made with 🍷 and ❤️ in North Carolina**

[View Demo](https://valleysomm.vercel.app) • [Report Bug](https://github.com/fordchristopheralan/valleysomm/issues) • [Request Feature](https://github.com/fordchristopheralan/valleysomm/issues)

</div>