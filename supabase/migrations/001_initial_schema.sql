-- DwellTime Database Schema
-- Run this in Supabase SQL Editor

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  mc_number TEXT,
  dot_number TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 75.00,
  grace_period_minutes INTEGER NOT NULL DEFAULT 120,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'fleet')),
  stripe_customer_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- FACILITIES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  geofence_radius_meters INTEGER NOT NULL DEFAULT 150,
  facility_type TEXT CHECK (facility_type IN ('warehouse', 'distribution_center', 'port', 'rail_yard', 'other')),
  avg_detention_minutes INTEGER,
  total_events INTEGER NOT NULL DEFAULT 0,
  avg_rating DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create spatial index for facility lookups
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(lat, lng);

-- ===========================================
-- DETENTION EVENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS detention_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  facility_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('pickup', 'delivery')),
  load_reference TEXT,
  arrival_time TIMESTAMPTZ NOT NULL,
  departure_time TIMESTAMPTZ,
  grace_period_minutes INTEGER NOT NULL,
  detention_start_time TIMESTAMPTZ,
  total_detention_minutes INTEGER,
  hourly_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  weather_conditions JSONB,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_detention_events_user ON detention_events(user_id);
CREATE INDEX IF NOT EXISTS idx_detention_events_facility ON detention_events(facility_id);
CREATE INDEX IF NOT EXISTS idx_detention_events_status ON detention_events(status);
CREATE INDEX IF NOT EXISTS idx_detention_events_arrival ON detention_events(arrival_time DESC);

-- ===========================================
-- GPS LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES detention_events(id) ON DELETE CASCADE,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  accuracy DECIMAL(8,2),
  altitude DECIMAL(10,2),
  speed DECIMAL(8,2),
  heading DECIMAL(5,2),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for GPS log lookups
CREATE INDEX IF NOT EXISTS idx_gps_logs_event ON gps_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_timestamp ON gps_logs(event_id, timestamp);

-- ===========================================
-- PHOTOS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES detention_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('arrival', 'trailer', 'dock', 'departure', 'issue', 'other')),
  caption TEXT,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  taken_at TIMESTAMPTZ NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for photo lookups
CREATE INDEX IF NOT EXISTS idx_photos_event ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id);

-- ===========================================
-- FACILITY RATINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS facility_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES detention_events(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags TEXT[], -- e.g., ['slow_loading', 'rude_staff', 'good_parking']
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(facility_id, user_id, event_id)
);

-- Index for rating lookups
CREATE INDEX IF NOT EXISTS idx_facility_ratings_facility ON facility_ratings(facility_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE detention_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Users: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Detention Events: Users can only see/edit their own events
CREATE POLICY "Users can view own events" ON detention_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON detention_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON detention_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON detention_events
  FOR DELETE USING (auth.uid() = user_id);

-- GPS Logs: Users can only access logs for their own events
CREATE POLICY "Users can view own GPS logs" ON gps_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM detention_events
      WHERE detention_events.id = gps_logs.event_id
      AND detention_events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own GPS logs" ON gps_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM detention_events
      WHERE detention_events.id = gps_logs.event_id
      AND detention_events.user_id = auth.uid()
    )
  );

-- Photos: Users can only access photos for their own events
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON photos
  FOR DELETE USING (auth.uid() = user_id);

-- Facilities: Everyone can read facilities
CREATE POLICY "Anyone can view facilities" ON facilities
  FOR SELECT USING (true);

-- Facility Ratings: Users can read all, but only write their own
CREATE POLICY "Anyone can view ratings" ON facility_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON facility_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON facility_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detention_events_updated_at
  BEFORE UPDATE ON detention_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_ratings_updated_at
  BEFORE UPDATE ON facility_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate facility statistics after new rating
CREATE OR REPLACE FUNCTION update_facility_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE facilities
  SET
    avg_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM facility_ratings
      WHERE facility_id = NEW.facility_id
    ),
    total_events = (
      SELECT COUNT(*)
      FROM detention_events
      WHERE facility_id = NEW.facility_id
    ),
    avg_detention_minutes = (
      SELECT AVG(total_detention_minutes)::INTEGER
      FROM detention_events
      WHERE facility_id = NEW.facility_id
      AND total_detention_minutes IS NOT NULL
    )
  WHERE id = NEW.facility_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facility_stats_on_rating
  AFTER INSERT OR UPDATE ON facility_ratings
  FOR EACH ROW EXECUTE FUNCTION update_facility_stats();

-- ===========================================
-- SEED DATA (Optional test facilities)
-- ===========================================
INSERT INTO facilities (name, address, city, state, zip, lat, lng, facility_type) VALUES
  ('Amazon Fulfillment Center DFW1', '2700 Regent Blvd', 'DFW Airport', 'TX', '75261', 32.8998, -97.0403, 'distribution_center'),
  ('Walmart Distribution Center #6024', '500 N Walton Blvd', 'Bentonville', 'AR', '72712', 36.3728, -94.2088, 'distribution_center'),
  ('Port of Los Angeles - Pier 400', '401 Seaside Ave', 'San Pedro', 'CA', '90731', 33.7361, -118.2628, 'port'),
  ('BNSF Intermodal Facility', '1601 S Lamar St', 'Dallas', 'TX', '75215', 32.7690, -96.7950, 'rail_yard'),
  ('Costco Regional Depot', '1000 Commercial Way', 'Mira Loma', 'CA', '91752', 33.9897, -117.5156, 'warehouse')
ON CONFLICT DO NOTHING;
