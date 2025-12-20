# 🍷 Valley Somm

**Understand what makes wine country trips great — and what doesn't.**

Valley Somm is a survey application for collecting and analyzing wine trip planning pain points. Built for product research, it includes a public survey form, analytics dashboard, qualitative review tools, and feature prioritization with ICE scoring.

[![Live Demo](https://img.shields.io/badge/demo-valleysomm.com-amber)](https://www.valleysomm.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Table of Contents

- [Features](#features)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Supabase Setup](#supabase-setup)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Survey Questions](#survey-questions)
  - [Themes](#themes)
- [Customization](#customization)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 📋 Survey Collection
- Multi-step survey with progress indicator
- Support for multiple question types (single choice, multi-select, scale, free text)
- Conditional "other" fields for custom responses
- Optional email capture with gift card drawing entry
- Mobile-responsive design

### 📊 Analytics Dashboard
- Real-time response metrics
- Filter by source, email presence, and time period
- Visual charts for all categorical questions
- Response timeline tracking
- "Other" response aggregation

### 🏷️ Qualitative Review Tool
- Tag open-ended responses with themes
- Score pain intensity (1-5 scale)
- Assign primary pain categories
- Add review notes
- Track review progress

### 📈 Feature Analysis
- **Pain Point Matrix**: Frequency, intensity, and willingness-to-pay by theme
- **Segment Analysis**: Compare themes across group types, confidence levels, and sources
- **ICE Scoring**: Prioritize feature concepts with Impact × Confidence × Ease

---

## Live Demo

🔗 **Survey**: [valleysomm.com](https://www.valleysomm.com)

The dashboard, review, and analysis pages are password-protected.

---

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- A [Supabase](https://supabase.com) account (free tier works)

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** and run the schema setup:

<details>
<summary>📄 Click to expand SQL schema</summary>

```sql
-- Main survey responses table
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

-- Themes table for custom theme management
CREATE TABLE themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default themes
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

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_concepts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for MVP)
CREATE POLICY "Allow anonymous inserts" ON survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow reads" ON survey_responses
  FOR SELECT USING (true);

CREATE POLICY "Allow updates" ON survey_responses
  FOR UPDATE USING (true);

CREATE POLICY "Allow all on themes" ON themes
  FOR ALL USING (true);

CREATE POLICY "Allow all on features" ON feature_concepts
  FOR ALL USING (true);
```

</details>

3. Go to **Settings → API** and copy your:
   - Project URL
   - `anon` public key

### Local Development

```bash
# Clone the repository
git clone https://github.com/fordchristopheralan/valleysomm.git
cd valleysomm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_DASHBOARD_PASSWORD=choose-a-secure-password
```

```bash
# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Deployment

#### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DASHBOARD_PASSWORD`
4. Deploy!

#### Custom Domain

Add your domain in Vercel's domain settings. The app will be available at:
- **Survey**: `yourdomain.com`
- **Dashboard**: `yourdomain.com/dashboard`
- **Review**: `yourdomain.com/review`
- **Analysis**: `yourdomain.com/analysis`

---

## Project Structure

```
valleysomm/
├── app/
│   ├── layout.js           # Root layout with metadata
│   ├── page.js             # Survey form (public)
│   ├── globals.css         # Tailwind CSS import
│   ├── dashboard/
│   │   └── page.js         # Analytics dashboard
│   ├── review/
│   │   └── page.js         # Response review tool
│   └── analysis/
│       └── page.js         # Pain point & feature analysis
├── lib/
│   └── supabase.js         # Supabase client configuration
├── public/                 # Static assets
├── .env.example            # Environment template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json
```

---

## How It Works

### User Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Survey    │ ──▶ │  Dashboard  │ ──▶ │   Review    │ ──▶ │  Analysis   │
│  (Public)   │     │ (Overview)  │     │  (Tagging)  │     │ (Insights)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. **Survey** (`/`): Visitors complete the 4-step survey about their wine trip experiences
2. **Dashboard** (`/dashboard`): View aggregate metrics, charts, and filter responses
3. **Review** (`/review`): Manually tag open-ended responses with themes and score intensity
4. **Analysis** (`/analysis`): See pain point rankings, segment breakdowns, and prioritize features

### Survey Sections

| Step | Title | Questions |
|------|-------|-----------|
| 1 | Your Experience | Regions visited, planning timeline, group type |
| 2 | Planning & Discovery | Hardest part, discovery methods, confidence |
| 3 | Logistics | Designated driver, reservations |
| 4 | Insights & Wrap-up | What would help, surprises, WTP, source, email |

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `NEXT_PUBLIC_DASHBOARD_PASSWORD` | Yes | Password for admin pages |

### Survey Questions

Questions are configured in `app/page.js`. Each question object supports:

```javascript
{
  id: 'field_name',           // Database column name
  type: 'single',             // 'single' | 'multiselect' | 'textarea' | 'scale' | 'email_with_options'
  question: 'Your question?',
  options: ['Option A', 'Option B'],  // For single/multiselect
  otherFields: {                       // Optional custom input
    'Other': { id: 'field_other', placeholder: 'Please specify...' }
  },
  // Scale-specific
  lowLabel: 'Low',
  highLabel: 'High',
  // Textarea-specific
  placeholder: 'Enter your response...'
}
```

**Adding a new question:**
1. Add the column to `survey_responses` table in Supabase
2. Add the question object to the `questions` array
3. Include its index in the appropriate step in `steps` array
4. Update `handleSubmit` to include the new field

### Themes

Default themes are seeded in the database. You can:
- Add themes via SQL: `INSERT INTO themes (name) VALUES ('New Theme');`
- Add themes in the Review UI using the "Add Custom Theme" feature

---

## Customization

### Branding & Colors

The app uses Tailwind's `amber` (primary) and `stone` (neutral) palettes. To change:

1. Search and replace color classes throughout the codebase
2. Primary actions: `amber-500`, `amber-600`
3. Backgrounds: `stone-100`, `stone-50`
4. Text: `stone-800`, `stone-600`, `stone-400`

### Gift Card Amount

Search for `$50` in `app/page.js` and update the amount.

### Survey Deadline

Update the deadline text in:
- `app/page.js` (survey header)
- `app/dashboard/page.js` (footer)

### Meta Tags

Edit `app/layout.js` to update:
- Page title
- Description
- Open Graph tags

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1 | React framework with App Router |
| [React](https://react.dev/) | 19.2 | UI library |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1 | Utility-first CSS |
| [Supabase](https://supabase.com/) | 2.89 | PostgreSQL database & API |
| [Recharts](https://recharts.org/) | 3.6 | Charting library |
| [Vercel](https://vercel.com/) | — | Hosting & deployment |

---

## Troubleshooting

### "Error fetching data" on dashboard
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are created
- Ensure tables exist in your database

### Survey submissions not saving
- Check browser console for errors
- Verify Supabase connection in Network tab
- Ensure `survey_responses` table has the INSERT policy

### Charts not rendering
- Make sure you have responses in the database
- Check that the field names match between code and database

### Password not working
- Environment variables require a redeploy to take effect
- Clear browser cache/cookies
- Check for typos in `NEXT_PUBLIC_DASHBOARD_PASSWORD`

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

MIT — do whatever you want with it.

---

<p align="center">
  Built with 🍷 for wine lovers everywhere
</p>
