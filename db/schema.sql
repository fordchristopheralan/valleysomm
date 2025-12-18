-- Valley Somm Database Schema
-- Run this in your Neon SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- WINERIES TABLE
-- Core winery data - the heart of the app
-- ============================================
CREATE TABLE wineries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,                          -- Short description
    engaging_description TEXT,                 -- AI-generated long description for Claude's context
    
    -- Location
    address_street VARCHAR(255) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state CHAR(2) DEFAULT 'NC',
    address_zip VARCHAR(10) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    
    -- Contact
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Hours (flexible JSONB for various formats)
    hours JSONB DEFAULT '{}',                  -- {mon: "12-6", tue: "closed", ...}
    
    -- Visiting info
    reservation_required VARCHAR(50) DEFAULT 'no',  -- 'no', 'recommended', 'required'
    tasting_fee VARCHAR(50),                   -- Display string like "~$15-20"
    tasting_fee_min DECIMAL(6,2),              -- For filtering: minimum
    tasting_fee_max DECIMAL(6,2),              -- For filtering: maximum
    
    -- Quality & ratings
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10) DEFAULT 5,
    google_rating DECIMAL(2,1),
    google_review_count VARCHAR(20),           -- "1,300+" format from source data
    
    -- Categorization (arrays for flexible matching)
    wine_styles TEXT[] DEFAULT '{}',           -- ['dry_reds', 'vinifera', 'sweet', 'sparkling']
    varietals TEXT[] DEFAULT '{}',             -- ['cabernet_franc', 'chardonnay', 'merlot']
    amenities TEXT[] DEFAULT '{}',             -- ['food', 'scenic_views', 'pet_friendly', 'tours']
    
    -- AI-matching attributes
    vibe TEXT[] DEFAULT '{}',                  -- ['romantic', 'casual', 'upscale', 'rustic', 'modern']
    best_for TEXT[] DEFAULT '{}',              -- ['couples', 'groups', 'families', 'beginners', 'enthusiasts']
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for wineries
CREATE INDEX idx_wineries_slug ON wineries(slug);
CREATE INDEX idx_wineries_location ON wineries(latitude, longitude);
CREATE INDEX idx_wineries_quality ON wineries(quality_score DESC);
CREATE INDEX idx_wineries_active ON wineries(is_active);
CREATE INDEX idx_wineries_wine_styles ON wineries USING GIN(wine_styles);
CREATE INDEX idx_wineries_amenities ON wineries USING GIN(amenities);
CREATE INDEX idx_wineries_vibe ON wineries USING GIN(vibe);
CREATE INDEX idx_wineries_best_for ON wineries USING GIN(best_for);

-- ============================================
-- SESSIONS TABLE
-- Anonymous user sessions
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- How they're using the app
    input_mode VARCHAR(20) DEFAULT 'chat',     -- 'chat', 'quick_plan', 'browse'
    
    -- Extracted/selected preferences (structured for analytics)
    preferences JSONB,                         -- {wine_style, varietals, priorities, occasion, ...}
    
    -- Trip details
    trip_dates JSONB,                          -- {start: '2026-05-10', end: '2026-05-11'}
    group_size INTEGER,
    starting_location VARCHAR(255),
    
    -- Contact (captured later, optional)
    email VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_created ON sessions(created_at);
CREATE INDEX idx_sessions_input_mode ON sessions(input_mode);
CREATE INDEX idx_sessions_email ON sessions(email) WHERE email IS NOT NULL;

-- ============================================
-- ITINERARIES TABLE
-- Saved trip plans
-- ============================================
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    
    -- Shareable link token
    share_token VARCHAR(64) UNIQUE NOT NULL,
    
    -- Itinerary content
    title VARCHAR(255),                        -- Optional custom title
    wineries JSONB NOT NULL,                   -- [{winery_id, day, order, suggested_time}, ...]
    narrative TEXT,                            -- AI-generated trip description
    
    -- Computed route info
    total_drive_time_minutes INTEGER,
    total_distance_miles DECIMAL(6,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for itineraries
CREATE INDEX idx_itineraries_session ON itineraries(session_id);
CREATE INDEX idx_itineraries_share_token ON itineraries(share_token);
CREATE INDEX idx_itineraries_created ON itineraries(created_at);

-- ============================================
-- CONVERSATIONS TABLE
-- Chat history with AI
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    
    -- Message history
    messages JSONB DEFAULT '[]',               -- [{role, content, timestamp}, ...]
    
    -- What AI extracted from conversation
    extracted_preferences JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX idx_conversations_session ON conversations(session_id);

-- ============================================
-- EVENTS TABLE
-- Analytics tracking
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    
    event_type VARCHAR(100) NOT NULL,          -- 'chat_message', 'winery_clicked', 'itinerary_created', etc.
    properties JSONB DEFAULT '{}',             -- Event-specific data
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- Active wineries with computed fields
CREATE VIEW wineries_active AS
SELECT 
    *,
    COALESCE(google_rating, quality_score::decimal / 2) as display_rating
FROM wineries 
WHERE is_active = true;

-- Session analytics summary
CREATE VIEW session_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as day,
    input_mode,
    COUNT(*) as session_count,
    COUNT(CASE WHEN preferences IS NOT NULL THEN 1 END) as with_preferences,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email
FROM sessions
GROUP BY DATE_TRUNC('day', created_at), input_mode;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER wineries_updated_at
    BEFORE UPDATE ON wineries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
