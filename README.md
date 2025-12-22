<p align="center">
  <img src="https://img.shields.io/badge/🍷-ValleySomm-6B2D3F?style=for-the-badge&labelColor=2D4A3E" alt="ValleySomm" />
</p>

<h1 align="center">
  <strong>Valley</strong>Somm
</h1>

<p align="center">
  <em>"Your AI Sommelier for Yadkin Valley Wine Adventures"</em>
</p>

<p align="center">
  <a href="https://www.valleysomm.com">
    <img src="https://img.shields.io/badge/Live_Site-ValleySomm.com-C9A962?style=flat-square" alt="Live Site" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <strong>Chat. Plan. Taste.</strong> — Discover 50+ curated wineries and create shareable itineraries in minutes, not hours.
</p>

---

## 🍇 About ValleySomm

ValleySomm is an AI-powered wine trip planning companion for **Yadkin Valley**, North Carolina's premier wine region. Simply chat with our friendly AI to discover hidden gems, plan your perfect route, and create beautiful shareable itineraries.

### The Problem We're Solving

Planning a wine country trip is overwhelming:
- 🤯 **Too many options** — Where do you even start with 50+ wineries?
- 🗺️ **Logistics nightmare** — Which wineries are close together? What's the best route?
- 🎯 **Preference matching** — How do you find wineries that match YOUR taste?
- 📅 **Reservation chaos** — Booking multiple tastings across different websites
- 🚗 **The DD dilemma** — How do you handle transportation safely?

### Our Solution

An AI sommelier that knows every winery in the valley and speaks your language. Tell it what you like, and it crafts the perfect day for you.

**Research Validation:** 32 wine country travelers surveyed with 84% willingness to pay, 4.1/5 average trip planning confidence, and "information gaps" identified as the #1 pain point (59% frequency, 95% WTP rate).

---

## ✨ Features

### 🔬 **Research & Validation (LIVE)**
Comprehensive survey system capturing real wine trip planning pain points with advanced analytics:
- **4-step survey** with mobile-optimized UX and progress tracking
- **UTM tracking** for multi-channel attribution (Reddit, Facebook, Instagram)
- **Funnel analytics** tracking session events, drop-off points, and completion rates
- **32+ responses** validating product-market fit and feature prioritization

### 📊 **Analytics Dashboard (LIVE)**
Password-protected insights into survey responses:
- Real-time filtering by source, email status, and time period
- Interactive charts (Recharts) for visualizing response patterns
- Open-ended response tagging and analysis
- Drawing entry and results opt-in tracking

### 🏷️ **Response Review Tool (LIVE)**
Manual qualitative analysis interface:
- Theme tagging system (10 default themes: Discovery, Logistics, Transportation, etc.)
- Intensity scoring (1-5 scale) based on emotional language
- Pain category classification
- Custom theme creation
- Review notes and metadata tracking

### 📈 **Pain Point Analysis (LIVE)**
ICE framework for feature prioritization:
- **Pain Point Matrix** — Frequency × Intensity × WTP rates
- **Segment Analysis** — Compare themes by group type, confidence, WTP, source
- **ICE Scoring** — Impact × Confidence × Ease for feature concepts
- Export-ready insights for product roadmap decisions

### 📊 **Funnel Analytics (LIVE)**
Session-level conversion tracking and optimization:
- **Step-by-step funnel** — Visualize progression from start to completion
- **Drop-off analysis** — Identify exactly where users abandon (by step transition)
- **Source performance** — Compare completion rates across UTM sources (Reddit, Facebook, etc.)
- **Device breakdown** — Mobile vs. desktop completion rates
- **Duration tracking** — Average time to complete, per-session timing
- **Real-time metrics** — Total sessions, completed surveys, conversion rate %

### 🏰 **Winery Data Management (LIVE)**
Complete self-service system for winery partners:
- **Self-service submission** — 10-minute form for wineries to add themselves
- **Admin review dashboard** — Approve, reject, or edit pending submissions
- **Claim listing workflow** — Verification system for existing wineries (email/phone/domain)
- **Tiered verification** — Auto-approve strong matches, manual review for edge cases

### 🍷 **Winery Database (SCHEMA READY)**
70+ field "golden record" schema covering:
- Basic info, location (lat/long for routing), hours (JSONB)
- Wine profiles, pricing, atmosphere, facilities
- AI matching fields: `personality_keywords[]`, `best_for[]`, `perfect_if[]`
- Trip planning metadata: visit duration, crowd levels, ideal timing

### 🤖 **AI Chat Interface (IN PROGRESS)**
Conversational trip planner powered by Claude Sonnet 4:
- 7-step conversation flow (date, group, preferences, vibe, transportation, food, special requests)
- Mobile-first message bubbles with quick reply buttons
- Desktop split-screen with real-time trip summary + map
- ~$0.10-0.17 per trip plan (49k tokens average)

---

## 🎨 Brand Identity

ValleySomm features a carefully crafted brand identity that blends wine country elegance with modern tech sensibility.

| Element | Colors |
|---------|--------|
| **Wine Tones** | `#6B2D3F` Wine Deep · `#8B3A4D` Burgundy · `#C4637A` Rosé |
| **Valley Greens** | `#2D4A3E` Deep · `#5B7C6F` Sage · `#8FA99E` Mist |
| **Accents** | `#C9A962` Gold · `#FAF7F2` Cream · `#2C2C30` Charcoal |

**Typography:** Cormorant Garamond (Display) + DM Sans (Body)

> 📋 Full brand kit available in `/valleysomm-brand-kit.html`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/valleysomm.git
cd valleysomm
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase Database

Run the following SQL in your Supabase SQL Editor:

**Survey Tables:**
```sql
-- Survey responses (main survey data)
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Survey answers
  regions TEXT[] DEFAULT '{}',
  regions_other_us TEXT,
  regions_international TEXT,
  planning_time TEXT,
  group_type TEXT,
  hardest_part TEXT,
  discovery TEXT[] DEFAULT '{}',
  discovery_other TEXT,
  confidence INTEGER,
  driver TEXT,
  driver_other TEXT,
  reservations TEXT,
  easier TEXT,
  surprise TEXT,
  pay TEXT,
  source TEXT,
  source_other TEXT,
  email TEXT,
  wants_drawing BOOLEAN DEFAULT FALSE,
  wants_results BOOLEAN DEFAULT FALSE,
  
  -- Review/analysis fields
  hardest_part_themes TEXT[] DEFAULT '{}',
  easier_themes TEXT[] DEFAULT '{}',
  surprise_themes TEXT[] DEFAULT '{}',
  intensity_score INTEGER,
  pain_category TEXT,
  review_notes TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics tracking (funnel analysis)
CREATE TABLE survey_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  response_id UUID REFERENCES survey_responses(id),
  
  -- Attribution
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  
  -- Device/Browser
  device_type TEXT,
  
  -- Journey tracking
  step_events JSONB DEFAULT '[]',
  question_events JSONB DEFAULT '[]',
  
  -- Completion
  completed BOOLEAN DEFAULT FALSE,
  abandoned_at_step INTEGER,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  total_duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes for response tagging
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature concepts for ICE scoring
CREATE TABLE feature_concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pain_point TEXT,
  impact INTEGER DEFAULT 5,
  confidence INTEGER DEFAULT 5,
  ease INTEGER DEFAULT 5,
  ice_score INTEGER GENERATED ALWAYS AS (impact * confidence * ease) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default themes
INSERT INTO themes (name) VALUES
  ('Discovery / Matching'),
  ('Logistics / Routing'),
  ('Transportation / DD'),
  ('Reservations'),
  ('Group Coordination'),
  ('Information Gaps'),
  ('Food / Lodging'),
  ('Budget / Pricing'),
  ('Time Management'),
  ('Overwhelm / Too Many Options');

-- Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_concepts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow anonymous inserts" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "Allow updates" ON survey_responses FOR UPDATE USING (true);

CREATE POLICY "Allow analytics inserts" ON survey_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow analytics reads" ON survey_analytics FOR SELECT USING (true);
CREATE POLICY "Allow analytics updates" ON survey_analytics FOR UPDATE USING (true);

CREATE POLICY "Allow all on themes" ON themes FOR ALL USING (true);
CREATE POLICY "Allow all on features" ON feature_concepts FOR ALL USING (true);
```

**Winery Tables** (for AI chat feature):
```sql
-- See /docs/wineries-schema.sql for complete 70+ field schema
-- Includes: wine profiles, AI matching, location data, operating details
```

### 4. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Dashboard Password (protects /dashboard, /review, /analysis, /winery/admin)
NEXT_PUBLIC_DASHBOARD_PASSWORD=your-secure-password
```

> ⚠️ **Important:** Choose a strong password for `NEXT_PUBLIC_DASHBOARD_PASSWORD` — this protects your survey data and admin tools from public access.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 + JavaScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL) |
| **Charts** | Recharts 3.6 |
| **Deployment** | Vercel |
| **AI** | Claude Sonnet 4 (Anthropic) |
| **Fonts** | Cormorant Garamond, DM Sans |

---

## 📂 Project Structure

```
valleysomm/
├── app/
│   ├── page.js                 # Main survey page (4-step flow)
│   ├── layout.js               # Root layout with metadata
│   ├── globals.css             # Global Tailwind imports
│   │
│   ├── dashboard/
│   │   └── page.js             # Analytics dashboard (charts, filters)
│   │
│   ├── review/
│   │   └── page.js             # Response review tool (theme tagging)
│   │
│   ├── analysis/
│   │   └── page.js             # Pain point matrix + ICE scoring
│   │
│   ├── funnel/
│   │   └── page.js             # Funnel analytics (drop-off analysis)
│   │
│   ├── winery/
│   │   ├── submit/
│   │   │   └── page.js         # Self-service winery submission
│   │   ├── admin/
│   │   │   └── page.js         # Admin review dashboard
│   │   └── claim/
│   │       └── page.js         # Claim existing listing
│   │
│   ├── privacy/
│   │   └── page.tsx            # Privacy policy
│   ├── terms/
│   │   └── page.tsx            # Terms of service
│   └── rules/
│       └── page.tsx            # Drawing rules
│
├── lib/
│   ├── supabase.js             # Supabase client
│   └── analytics.js            # Survey funnel tracking
│
├── public/                      # Static assets
├── valleysomm-brand-kit.html   # Complete brand identity guide
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 📊 Survey Research Insights

**Current Results (32 responses as of Dec 2024):**
- **84% willingness to pay** (50% "Yes — take my money")
- **4.1/5 average confidence** in winery selection
- **Top pain point:** Information gaps (59% frequency, 95% WTP)
- **Key insight:** Users don't struggle with *finding* wineries, they struggle with *managing logistics*

**Survey Methodology:**
- 4-step progressive flow (Your Experience → Planning & Discovery → Logistics → Wrap-up)
- 12 questions capturing planning habits, pain points, and preferences
- UTM tracking across Reddit, Facebook, Instagram campaigns
- $50 gift card incentive (drawing closes Jan 20, 2025)
- Mobile-optimized with real-time progress indicators

**Data Applications:**
- Feature prioritization via ICE scoring framework
- Segment analysis (group type, confidence level, WTP, source)
- Conversion funnel optimization (identifying drop-off points)
- Value proposition validation for investor/winery pitches

---

## 🗺️ Roadmap

### ✅ **Phase 1: Research & Foundation** (COMPLETE)
- [x] Brand identity & design system
- [x] User research survey system (4-step flow)
- [x] UTM tracking & attribution
- [x] Analytics dashboard with filters
- [x] Response review tool (theme tagging)
- [x] Pain point analysis (matrix + segments)
- [x] ICE scoring for features
- [x] Funnel analytics
- [x] Winery database schema (70+ fields)
- [x] Winery self-service submission
- [x] Admin review dashboard
- [x] Claim listing workflow

### 🚧 **Phase 2: MVP Development** (IN PROGRESS)
- [ ] AI chat interface (Claude Sonnet 4)
- [ ] Winery data collection (top 20 priority)
- [ ] Email verification system
- [ ] Conversation flow implementation
- [ ] Basic itinerary generator
- [ ] Mobile chat UI

### 📅 **Phase 3: Beta Launch** (Q1 2025)
- [ ] Mapbox routing integration
- [ ] Shareable trip cards
- [ ] Winery partner onboarding (Tier 2 hidden gems)
- [ ] Visitor analytics for wineries
- [ ] Beta user testing
- [ ] Performance optimization (prompt caching)

### 🚀 **Phase 4: Public Launch** (Q2 2025)
- [ ] Freemium model ($9.99/mo Pro tier)
- [ ] Winery premium listings ($49-99/mo)
- [ ] Mobile app (React Native)
- [ ] Trip booking integration
- [ ] Social sharing features
- [ ] Transportation partnerships

---

## 💰 Business Model

### Revenue Streams
1. **Consumer Subscription:**
   - Free: 3 trips/month, basic features
   - Pro ($9.99/mo): Unlimited trips, advanced matching, priority support

2. **Winery Partnerships:**
   - Free: Basic listing (always free)
   - Basic ($49/mo): Verified badge, priority placement, visitor analytics
   - Premium ($99/mo): Featured placement, enhanced analytics, booking integration

3. **Pay-Per-Trip (Alternative):**
   - $4.99 per custom itinerary (97% margin after AI costs)

### Unit Economics
- **AI Cost per Trip:** $0.10-0.17 (Claude Sonnet 4, ~49k tokens)
- **Monthly at Scale:**
  - 100 trips = $10-17
  - 1,000 trips = $100-170
  - 10,000 trips = $1,000-1,700
- **Optimization:** Prompt caching can reduce costs 70-90%

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DASHBOARD_PASSWORD`
4. Deploy!

**Live URLs:**
- **Survey:** [valleysomm.com](https://valleysomm.com)
- **Dashboard:** [valleysomm.com/dashboard](https://valleysomm.com/dashboard) (password-protected)
- **Review Tool:** [valleysomm.com/review](https://valleysomm.com/review) (password-protected)
- **Analysis:** [valleysomm.com/analysis](https://valleysomm.com/analysis) (password-protected)
- **Funnel Analytics:** [valleysomm.com/funnel](https://valleysomm.com/funnel) (password-protected)
- **Winery Submit:** [valleysomm.com/winery/submit](https://valleysomm.com/winery/submit)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 Documentation

- **Brand Kit:** `/valleysomm-brand-kit.html` — Complete visual identity guide
- **Database Schema:** `/docs/wineries-schema.sql` — Full winery database structure
- **Data Template:** `/docs/wineries-template.csv` — Manual data collection format
- **Winery Outreach:** `/docs/winery-outreach-strategy.md` — Partnership playbook
- **Chat Interface Spec:** `/docs/chat-interface-spec.md` — UI/UX requirements
- **Cost Analysis:** `/docs/cost-analysis.md` — AI pricing & revenue models
- **Verification Strategy:** `/docs/ownership-verification-strategy.md` — Winery claim process
- **Email Templates:** `/docs/winery-outreach-emails.md` — Outreach scripts

---

## 🔐 Security & Privacy

- **Password Protection:** All admin tools protected by `NEXT_PUBLIC_DASHBOARD_PASSWORD`
- **Anonymous Surveys:** Email collection is optional, anonymous responses welcome
- **RLS (Row Level Security):** Supabase policies prevent unauthorized data access
- **HTTPS Only:** All traffic encrypted via Vercel
- **No Tracking:** No Google Analytics, no third-party cookies (beyond session management)
- **Winery Verification:** Tiered system prevents fraudulent listing claims

---

## 📊 Survey Administration

### Accessing Admin Tools

All admin pages require the password set in `NEXT_PUBLIC_DASHBOARD_PASSWORD`:

1. **Dashboard** (`/dashboard`) — Overview, charts, filters
2. **Review** (`/review`) — Tag responses with themes
3. **Analysis** (`/analysis`) — Pain point matrix, ICE scoring
4. **Funnel** (`/funnel`) — Drop-off analysis
5. **Winery Admin** (`/winery/admin`) — Approve/reject submissions

### Drawing Management

- Drawing closes: **January 20, 2025**
- Winner selection: Filter by `wants_drawing = true` in dashboard
- Export emails: Use Supabase SQL Editor or dashboard export

### Data Export

**Via Supabase:**
```sql
-- Export all survey responses
SELECT * FROM survey_responses ORDER BY submitted_at DESC;

-- Export drawing entries only
SELECT email, submitted_at, source 
FROM survey_responses 
WHERE wants_drawing = true 
ORDER BY submitted_at DESC;

-- Export with review data
SELECT *, hardest_part_themes, intensity_score, pain_category 
FROM survey_responses 
WHERE reviewed = true;
```

---

## 📧 Support & Contact

- **Website:** [valleysomm.com](https://valleysomm.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/valleysomm/issues)
- **Email:** hello@valleysomm.com

---

## 🙏 Acknowledgments

- The Yadkin Valley wine community for inspiring this project
- 32 wine country travelers who shared their planning pain points
- Anthropic (Claude AI) for making conversational trip planning possible
- The open-source community for amazing tools (Next.js, Supabase, Tailwind)

---

## 📄 License

This project is licensed under the MIT License — do whatever you want with it.

---

<p align="center">
  <strong>ValleySomm</strong><br/>
  <em>AI-Powered Yadkin Valley Wine Planning</em><br/><br/>
  <a href="https://www.valleysomm.com">ValleySomm.com</a>
</p>

<p align="center">
  Made with 🍷 in North Carolina
</p>