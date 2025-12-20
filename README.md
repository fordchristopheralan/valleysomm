# Valley Somm — Wine Country Trip Survey

A simple survey app to understand wine country trip planning pain points. Built with Next.js, Tailwind CSS, and Supabase.

## Quick Start

### 1. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to the SQL Editor and run this to create your table:

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

-- Allow anonymous inserts for survey
CREATE POLICY "Allow anonymous inserts" ON survey_responses
  FOR INSERT WITH CHECK (true);

-- Allow reads (dashboard is password-protected at app level)
CREATE POLICY "Allow reads" ON survey_responses
  FOR SELECT USING (true);

CREATE POLICY "Allow updates" ON survey_responses
  FOR UPDATE USING (true);

CREATE POLICY "Allow all on themes" ON themes
  FOR ALL USING (true);

CREATE POLICY "Allow all on features" ON feature_concepts
  FOR ALL USING (true);
```

4. Go to Settings > API and copy your:
   - Project URL
   - `anon` public key

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DASHBOARD_PASSWORD` (choose something secure!)
4. Deploy!

If you have a custom domain (valleysomm.com), add it in Vercel's domain settings.

**URLs:**
- Survey: `yourdomain.com` or `your-project.vercel.app`
- Dashboard: `yourdomain.com/dashboard`

## Viewing & Analyzing Responses

### Dashboard (`/dashboard`)
Overview of all survey data with charts and metrics. Password-protected.

### Review Tool (`/review`)
Review individual responses and tag them with themes:
- Assign themes to open-ended responses
- Score intensity (1-5)
- Set primary pain category
- Add review notes
- Navigate between unreviewed responses

### Analysis (`/analysis`)
Three analysis tabs:
- **Pain Point Matrix**: Frequency, intensity, and WTP rates for each theme
- **Segment Analysis**: Compare themes across group types, confidence levels, WTP, and sources
- **Feature Concepts (ICE)**: Add and prioritize feature ideas with Impact × Confidence × Ease scoring

### Supabase Dashboard
Go to your Supabase project > Table Editor to view raw data or export CSV.

## Customization

### Change the Gift Card Amount
Edit the text in `app/page.js` — search for "$50" and update.

### Add/Remove Questions
Edit the `questions` array in `app/page.js`. Each question needs:
- `id`: unique identifier (used as database column)
- `type`: 'single', 'multiselect', 'textarea', 'scale', or 'email'
- `question`: the question text
- `options`: array of choices (for single/multiselect)

If you add new question IDs, update the Supabase table schema to match.

### Change Colors
The app uses Tailwind's `amber` and `stone` color palettes. Search and replace to customize.

## Tech Stack

- **Next.js 14** — React framework
- **Tailwind CSS** — Styling
- **Supabase** — Database & auth
- **Vercel** — Hosting

## License

MIT — do whatever you want with it.
