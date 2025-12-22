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
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
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

**Research Validation:** 32+ wine country travelers surveyed with 84% willingness to pay, 4.1/5 average trip planning confidence, and "information gaps" identified as the #1 pain point (59% frequency, 95% WTP rate).

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
- **Self-service submission** (`/winery/submit`) — 10-minute form for wineries to add themselves
- **Admin review dashboard** (`/winery/admin`) — Approve, reject, or edit pending submissions
- **Claim listing workflow** (`/winery/claim`) — Verification system for existing wineries (email/phone/domain)
- **Tiered verification** — Auto-approve strong matches, manual review for edge cases

### 📊 **Winery Analytics Dashboard (LIVE)**
Comprehensive data quality and coverage analysis:
- **Overview metrics** — Total wineries, coverage %, verification status breakdown
- **Data quality scoring** — Critical, important, and nice-to-have field completion
- **Distribution analysis** — Geographic spread, wine style coverage, amenity availability
- **Gap identification** — Missing fields, unverified listings, data improvement priorities
- **Radar charts** — Visual quality scores by category (contact, hours, wine, experience)

### 🍷 **Winery Database (SCHEMA READY)**
70+ field "golden record" schema covering:
- Basic info, location (lat/long for routing), hours (JSONB)
- Wine profiles, pricing, atmosphere, facilities
- AI matching fields: `personality_keywords[]`, `best_for[]`, `perfect_if[]`
- Trip planning metadata: visit duration, crowd levels, ideal timing

### 🏨 **Lodging Data Management (LIVE)**
Complete lodging database with wine-focused features:
- **Lodging Dashboard** (`/lodging/dashboard`) — Overview metrics, type/price distributions, amenity analysis
- **Lodging Review Tool** (`/lodging/review`) — Full editing interface with completeness scoring
- **Lodging Analysis** (`/lodging/analysis`) — Geographic coverage, winery connection analysis, data gap identification
- **Winery Integration** — Track on-site winery lodging, wine packages, proximity to nearest wineries
- **45+ field schema** — Location, amenities, vibe tags, best for, pricing, and partnership data

### 📋 **Legal & Compliance Pages (LIVE)**
- **Privacy Policy** (`/privacy`) — GDPR-ready data handling disclosure
- **Terms of Service** (`/terms`) — Usage terms and liability limitations
- **Official Rules** (`/rules`) — Gift card drawing legal requirements

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

- Node.js 20+
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

-- Wineries table (70+ fields)
CREATE TABLE wineries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT,
  city TEXT DEFAULT 'Elkin',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  email TEXT,
  
  -- Hours (JSONB for flexibility)
  hours JSONB DEFAULT '{}',
  
  -- Content
  description TEXT,
  tagline TEXT,
  
  -- Wine Profile
  wine_styles TEXT[] DEFAULT '{}',
  signature_wines TEXT,
  
  -- Experience
  vibe_tags TEXT[] DEFAULT '{}',
  best_for TEXT[] DEFAULT '{}',
  
  -- Reservations & Pricing
  reservation_policy TEXT,
  reservation_notes TEXT,
  tasting_fee_range TEXT,
  tasting_fee_waived TEXT,
  
  -- Amenities
  food_available TEXT,
  food_notes TEXT,
  outdoor_seating BOOLEAN DEFAULT FALSE,
  pet_friendly BOOLEAN DEFAULT FALSE,
  wheelchair_accessible BOOLEAN DEFAULT FALSE,
  
  -- Social
  instagram_handle TEXT,
  facebook_url TEXT,
  
  -- Admin
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  claim_token TEXT,
  
  -- Contact
  contact_name TEXT,
  contact_role TEXT,
  contact_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lodging table (45+ fields)
CREATE TABLE lodging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tagline TEXT,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NC',
  zip_code TEXT,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  
  -- Contact
  phone TEXT,
  website TEXT,
  email TEXT,
  booking_url TEXT,
  
  -- Property Details
  lodging_type TEXT NOT NULL,
  price_tier TEXT,
  price_range TEXT,
  room_count INTEGER,
  max_guests INTEGER,
  
  -- Amenities & Features
  amenities TEXT[] DEFAULT '{}',
  vibe_tags TEXT[] DEFAULT '{}',
  best_for TEXT[] DEFAULT '{}',
  
  -- Winery Connection
  winery_distance_notes TEXT,
  nearest_winery_id UUID REFERENCES wineries(id),
  nearest_winery_minutes INTEGER,
  wine_packages_available BOOLEAN DEFAULT FALSE,
  wine_package_notes TEXT,
  is_winery_lodging BOOLEAN DEFAULT FALSE,
  associated_winery_id UUID REFERENCES wineries(id),
  partner_winery_ids UUID[] DEFAULT '{}',
  partnership_notes TEXT,
  
  -- Policies
  check_in_time TEXT,
  check_out_time TEXT,
  minimum_stay INTEGER DEFAULT 1,
  
  -- Admin
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  priority_rank INTEGER DEFAULT 50,
  data_source TEXT,
  data_completeness_score INTEGER,
  last_verified_at TIMESTAMPTZ,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lodging
CREATE INDEX idx_lodging_active ON lodging(active);
CREATE INDEX idx_lodging_location ON lodging(latitude, longitude);
CREATE INDEX idx_lodging_type ON lodging(lodging_type);
CREATE INDEX idx_lodging_price_tier ON lodging(price_tier);
CREATE INDEX idx_lodging_vibe_tags ON lodging USING GIN(vibe_tags);
CREATE INDEX idx_lodging_best_for ON lodging USING GIN(best_for);
CREATE INDEX idx_lodging_winery_lodging ON lodging(is_winery_lodging) WHERE is_winery_lodging = TRUE;

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow anonymous inserts" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "Allow updates" ON survey_responses FOR UPDATE USING (true);

CREATE POLICY "Allow all on analytics" ON survey_analytics FOR ALL USING (true);
CREATE POLICY "Allow all on themes" ON themes FOR ALL USING (true);
CREATE POLICY "Allow all on features" ON feature_concepts FOR ALL USING (true);
CREATE POLICY "Allow all on wineries" ON wineries FOR ALL USING (true);
CREATE POLICY "Allow all on lodging" ON lodging FOR ALL USING (true);

-- Update trigger for lodging
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lodging_updated_at
  BEFORE UPDATE ON lodging
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_DASHBOARD_PASSWORD=your-secure-password
```

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
valleysomm/
├── app/
│   ├── page.js                  # Main survey (public)
│   ├── layout.js                # Root layout with metadata
│   ├── globals.css              # Tailwind imports
│   │
│   ├── dashboard/
│   │   └── page.js              # Survey analytics dashboard (protected)
│   │
│   ├── review/
│   │   └── page.js              # Response review & tagging (protected)
│   │
│   ├── analysis/
│   │   └── page.js              # Pain point matrix & ICE scoring (protected)
│   │
│   ├── funnel/
│   │   └── page.js              # Conversion funnel analytics (protected)
│   │
│   ├── winery/
│   │   ├── submit/
│   │   │   └── page.js          # Winery self-service submission (public)
│   │   ├── admin/
│   │   │   └── page.js          # Winery approval dashboard (protected)
│   │   └── claim/
│   │       └── page.js          # Winery claim verification (token-based)
│   │
│   ├── winery-analytics/
│   │   └── page.js              # Winery data quality dashboard (protected)
│   │
│   ├── lodging/
│   │   ├── dashboard/
│   │   │   └── page.js          # Lodging overview dashboard (protected)
│   │   ├── review/
│   │   │   └── page.js          # Lodging data editing tool (protected)
│   │   └── analysis/
│   │       └── page.js          # Lodging analytics & gaps (protected)
│   │
│   ├── privacy/
│   │   └── page.tsx             # Privacy policy (public)
│   │
│   ├── terms/
│   │   └── page.tsx             # Terms of service (public)
│   │
│   └── rules/
│       └── page.tsx             # Drawing official rules (public)
│
├── lib/
│   ├── supabase.js              # Supabase client
│   └── analytics.js             # Survey funnel tracking utilities
│
├── public/                       # Static assets
├── valleysomm-brand-kit.html    # Complete brand identity guide
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── jsconfig.json
└── README.md
```

---

## 📊 Survey Research Insights

**Current Results (32+ responses as of Dec 2024):**
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
- [x] Winery data quality analytics
- [x] Lodging database schema (45+ fields)
- [x] Lodging admin dashboard
- [x] Lodging review & editing tool
- [x] Lodging analytics & gap analysis
- [x] Legal pages (privacy, terms, rules)

### 🚧 **Phase 2: MVP Development** (IN PROGRESS)
- [ ] AI chat interface (Claude Sonnet 4)
- [ ] Winery data collection (top 20 priority)
- [ ] Lodging data collection (wine-focused properties)
- [ ] Email verification system
- [ ] Conversation flow implementation
- [ ] Basic itinerary generator
- [ ] Mobile chat UI

### 📅 **Phase 3: Beta Launch** (Q1 2025)
- [ ] Mapbox routing integration
- [ ] Shareable trip cards
- [ ] Winery partner onboarding (Tier 2 hidden gems)
- [ ] Lodging partner onboarding
- [ ] Visitor analytics for wineries
- [ ] Beta user testing
- [ ] Performance optimization (prompt caching)

### 🚀 **Phase 4: Public Launch** (Q2 2025)
- [ ] Freemium model ($9.99/mo Pro tier)
- [ ] Winery premium listings ($49-99/mo)
- [ ] Lodging partnerships
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
- **Winery Admin:** [valleysomm.com/winery/admin](https://valleysomm.com/winery/admin) (password-protected)
- **Winery Analytics:** [valleysomm.com/winery-analytics](https://valleysomm.com/winery-analytics) (password-protected)
- **Lodging Dashboard:** [valleysomm.com/lodging/dashboard](https://valleysomm.com/lodging/dashboard) (password-protected)
- **Lodging Review:** [valleysomm.com/lodging/review](https://valleysomm.com/lodging/review) (password-protected)
- **Lodging Analysis:** [valleysomm.com/lodging/analysis](https://valleysomm.com/lodging/analysis) (password-protected)
- **Privacy Policy:** [valleysomm.com/privacy](https://valleysomm.com/privacy)
- **Terms of Service:** [valleysomm.com/terms](https://valleysomm.com/terms)
- **Drawing Rules:** [valleysomm.com/rules](https://valleysomm.com/rules)

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
- **Lodging Schema:** `/docs/lodging-schema.sql` — Lodging database structure
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
- **Legal Compliance:** Privacy policy, terms of service, and drawing rules published

---

## 📊 Admin Tools Reference

### Accessing Admin Tools

All admin pages require the password set in `NEXT_PUBLIC_DASHBOARD_PASSWORD`:

**Survey Administration:**
1. **Dashboard** (`/dashboard`) — Overview, charts, filters
2. **Review** (`/review`) — Tag responses with themes
3. **Analysis** (`/analysis`) — Pain point matrix, ICE scoring
4. **Funnel** (`/funnel`) — Drop-off analysis

**Winery Administration:**
5. **Winery Admin** (`/winery/admin`) — Approve/reject submissions
6. **Winery Analytics** (`/winery-analytics`) — Data quality & coverage

**Lodging Administration:**
7. **Lodging Dashboard** (`/lodging/dashboard`) — Overview metrics, type/price distributions
8. **Lodging Review** (`/lodging/review`) — Edit lodging data, completeness scoring
9. **Lodging Analysis** (`/lodging/analysis`) — Geographic coverage, winery connections, data gaps

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

-- Export winery data
SELECT * FROM wineries WHERE status = 'approved' ORDER BY name;

-- Export lodging data
SELECT * FROM lodging WHERE active = true ORDER BY name;

-- Export lodging with winery connections
SELECT l.name, l.city, l.lodging_type, l.is_winery_lodging, 
       l.wine_packages_available, l.nearest_winery_minutes,
       w.name as nearest_winery
FROM lodging l
LEFT JOIN wineries w ON l.nearest_winery_id = w.id
ORDER BY l.name;
```

---

## 📧 Support & Contact

- **Website:** [valleysomm.com](https://valleysomm.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/valleysomm/issues)
- **Email:** hello@valleysomm.com

---

## 🙏 Acknowledgments

- The Yadkin Valley wine community for inspiring this project
- 32+ wine country travelers who shared their planning pain points
- Anthropic (Claude AI) for making conversational trip planning possible
- The open-source community for amazing tools (Next.js, Supabase, Tailwind, Recharts)

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