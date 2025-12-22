-- ============================================
-- ValleySomm Winery Database Schema
-- Version: 1.0
-- Last Updated: December 2024
-- ============================================

-- ============================================
-- CORE WINERIES TABLE (70+ fields)
-- ============================================

CREATE TABLE wineries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- ========================================
  -- BASIC INFORMATION
  -- ========================================
  name TEXT NOT NULL,
  slug TEXT UNIQUE,                          -- URL-friendly identifier (auto-generated)
  tagline TEXT,                              -- Short memorable phrase
  description TEXT,                          -- Full description (2-3 paragraphs)
  year_established INTEGER,
  
  -- ========================================
  -- LOCATION & CONTACT
  -- ========================================
  address TEXT,
  city TEXT DEFAULT 'Elkin',
  state TEXT DEFAULT 'NC',
  zip_code TEXT,
  county TEXT,
  
  -- Geocoding for routing
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- ========================================
  -- HOURS OF OPERATION (JSONB)
  -- ========================================
  -- Format: {"monday": "11am-6pm", "tuesday": "Closed", ...}
  hours JSONB DEFAULT '{}',
  hours_notes TEXT,                          -- "Seasonal hours vary", "Call ahead in winter"
  
  -- ========================================
  -- WINE PROFILE
  -- ========================================
  wine_styles TEXT[] DEFAULT '{}',           -- ['Dry Reds', 'Sweet Whites', 'Sparkling']
  signature_wines TEXT,                      -- "2021 Reserve Cabernet, Estate Chardonnay"
  grape_varieties TEXT[] DEFAULT '{}',       -- ['Cabernet Franc', 'Viognier', 'Chambourcin']
  production_style TEXT,                     -- 'Estate Grown', 'Sourced Grapes', 'Hybrid'
  annual_production TEXT,                    -- '5,000 cases', 'Small batch'
  awards TEXT,                               -- Notable awards and recognition
  
  -- ========================================
  -- TASTING EXPERIENCE
  -- ========================================
  tasting_fee_range TEXT,                    -- '$10-15', 'Free', '$20+'
  tasting_fee_waived TEXT,                   -- 'With purchase', 'Wine club members', 'Never'
  tasting_options TEXT,                      -- 'Standard flight, Reserve flight, By the glass'
  reservation_policy TEXT,                   -- 'required', 'recommended', 'walk-in'
  reservation_notes TEXT,                    -- 'Required for groups of 6+'
  reservation_url TEXT,                      -- Direct booking link
  group_size_limit INTEGER,                  -- Max group size
  private_tastings BOOLEAN DEFAULT FALSE,
  
  -- ========================================
  -- ATMOSPHERE & VIBE
  -- ========================================
  vibe_tags TEXT[] DEFAULT '{}',             -- ['Romantic', 'Family-Friendly', 'Upscale']
  setting TEXT,                              -- 'Vineyard views', 'Historic barn', 'Modern'
  crowd_level TEXT,                          -- 'Intimate', 'Lively', 'Varies by day'
  noise_level TEXT,                          -- 'Quiet', 'Moderate', 'Can be loud'
  best_time_to_visit TEXT,                   -- 'Weekday mornings', 'Sunset hours'
  visit_duration TEXT,                       -- '45-60 minutes', '1-2 hours'
  
  -- ========================================
  -- FOOD & AMENITIES
  -- ========================================
  food_available TEXT,                       -- 'none', 'snacks', 'light bites', 'full menu'
  food_notes TEXT,                           -- 'Cheese boards, charcuterie available'
  food_truck_schedule TEXT,                  -- 'Fridays and weekends'
  picnic_allowed BOOLEAN DEFAULT FALSE,
  picnic_notes TEXT,
  
  -- Seating & Space
  outdoor_seating BOOLEAN DEFAULT FALSE,
  outdoor_seating_notes TEXT,                -- 'Covered patio, vineyard terrace'
  indoor_capacity INTEGER,
  outdoor_capacity INTEGER,
  
  -- Accessibility & Policies
  pet_friendly BOOLEAN DEFAULT FALSE,
  pet_notes TEXT,                            -- 'Outdoor areas only'
  wheelchair_accessible BOOLEAN DEFAULT FALSE,
  accessibility_notes TEXT,
  child_friendly BOOLEAN DEFAULT TRUE,
  child_notes TEXT,
  
  -- ========================================
  -- EVENTS & EXPERIENCES
  -- ========================================
  events_hosted BOOLEAN DEFAULT FALSE,
  event_types TEXT[] DEFAULT '{}',           -- ['Weddings', 'Corporate', 'Live Music']
  event_capacity INTEGER,
  event_contact TEXT,
  
  tours_available BOOLEAN DEFAULT FALSE,
  tour_notes TEXT,                           -- 'Vineyard tours Sat/Sun at 2pm'
  
  wine_club BOOLEAN DEFAULT FALSE,
  wine_club_notes TEXT,
  
  -- ========================================
  -- AI MATCHING FIELDS
  -- ========================================
  personality_keywords TEXT[] DEFAULT '{}',  -- ['welcoming', 'educational', 'laid-back']
  best_for TEXT[] DEFAULT '{}',              -- ['First-timers', 'Wine enthusiasts', 'Groups']
  perfect_if TEXT[] DEFAULT '{}',            -- ['You love dry reds', 'You want scenic views']
  not_ideal_for TEXT[] DEFAULT '{}',         -- ['Large parties', 'Those seeking sweet wines']
  insider_tip TEXT,                          -- "Ask about the library wines"
  local_pairing TEXT,                        -- "Pairs great with BBQ from XYZ down the road"
  
  -- ========================================
  -- SOCIAL & MEDIA
  -- ========================================
  instagram_handle TEXT,
  facebook_url TEXT,
  twitter_handle TEXT,
  youtube_url TEXT,
  tripadvisor_url TEXT,
  yelp_url TEXT,
  google_place_id TEXT,
  
  -- Photos (URLs to CDN)
  hero_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  logo_url TEXT,
  
  -- ========================================
  -- BUSINESS & ADMIN
  -- ========================================
  status TEXT DEFAULT 'pending',             -- 'pending', 'approved', 'rejected', 'archived'
  verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT,                  -- 'email', 'phone', 'domain', 'manual'
  verified_at TIMESTAMPTZ,
  
  featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER,
  active BOOLEAN DEFAULT TRUE,
  
  -- Claim workflow
  claim_token TEXT,
  claim_token_expires_at TIMESTAMPTZ,
  claimed_by TEXT,                           -- Email of person who claimed
  claimed_at TIMESTAMPTZ,
  
  -- Submission tracking
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  submitted_by_role TEXT,
  submission_notes TEXT,
  
  admin_notes TEXT,
  
  -- ========================================
  -- PARTNER TIER (for monetization)
  -- ========================================
  partner_tier TEXT DEFAULT 'free',          -- 'free', 'basic', 'premium'
  partner_since TIMESTAMPTZ,
  partner_expires_at TIMESTAMPTZ,
  
  -- ========================================
  -- ANALYTICS (for partner dashboards)
  -- ========================================
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  itinerary_count INTEGER DEFAULT 0,         -- Times included in generated trips
  last_viewed_at TIMESTAMPTZ,
  
  -- ========================================
  -- TIMESTAMPS
  -- ========================================
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_wineries_slug ON wineries(slug);
CREATE INDEX idx_wineries_status ON wineries(status);
CREATE INDEX idx_wineries_city ON wineries(city);
CREATE INDEX idx_wineries_verified ON wineries(verified);
CREATE INDEX idx_wineries_active ON wineries(active);
CREATE INDEX idx_wineries_featured ON wineries(featured);
CREATE INDEX idx_wineries_partner_tier ON wineries(partner_tier);
CREATE INDEX idx_wineries_location ON wineries(latitude, longitude);

-- GIN indexes for array fields (for AI matching)
CREATE INDEX idx_wineries_wine_styles ON wineries USING GIN(wine_styles);
CREATE INDEX idx_wineries_vibe_tags ON wineries USING GIN(vibe_tags);
CREATE INDEX idx_wineries_best_for ON wineries USING GIN(best_for);
CREATE INDEX idx_wineries_personality ON wineries USING GIN(personality_keywords);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE wineries ENABLE ROW LEVEL SECURITY;

-- Public can read approved, active wineries
CREATE POLICY "Public read approved wineries" ON wineries
  FOR SELECT USING (status = 'approved' AND active = true);

-- Allow inserts for submissions
CREATE POLICY "Allow winery submissions" ON wineries
  FOR INSERT WITH CHECK (true);

-- Allow updates (admin dashboard is password-protected at app level)
CREATE POLICY "Allow winery updates" ON wineries
  FOR UPDATE USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_winery_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
    NEW.slug := regexp_replace(NEW.slug, '^-|-$', '', 'g');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_slug
  BEFORE INSERT ON wineries
  FOR EACH ROW
  EXECUTE FUNCTION generate_winery_slug();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_winery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp
  BEFORE UPDATE ON wineries
  FOR EACH ROW
  EXECUTE FUNCTION update_winery_timestamp();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Active approved wineries for public display
CREATE VIEW public_wineries AS
SELECT 
  id, name, slug, tagline, description,
  address, city, zip_code, latitude, longitude,
  phone, website, hours,
  wine_styles, signature_wines,
  tasting_fee_range, reservation_policy,
  vibe_tags, best_for, setting,
  food_available, outdoor_seating, pet_friendly,
  instagram_handle, hero_image_url,
  featured, partner_tier
FROM wineries
WHERE status = 'approved' AND active = true;

-- Wineries needing attention (admin dashboard)
CREATE VIEW wineries_pending_review AS
SELECT *
FROM wineries
WHERE status = 'pending'
ORDER BY created_at ASC;

-- Partner analytics summary
CREATE VIEW winery_analytics_summary AS
SELECT 
  id, name, partner_tier,
  view_count, click_count, itinerary_count,
  last_viewed_at,
  created_at
FROM wineries
WHERE status = 'approved'
ORDER BY itinerary_count DESC;
