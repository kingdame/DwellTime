-- ============================================================================
-- Migration: 005_truck_entrance
-- Description: Add truck entrance crowdsourcing fields to facilities
-- ============================================================================

-- Add truck entrance columns to facilities
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_different BOOLEAN DEFAULT FALSE;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_address TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_lat DECIMAL(10,8);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_lng DECIMAL(11,8);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_notes TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_verified_count INTEGER DEFAULT 0;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_last_updated_at TIMESTAMPTZ;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS truck_entrance_last_updated_by UUID REFERENCES auth.users(id);

-- Create truck entrance reports table for tracking contributions
CREATE TABLE IF NOT EXISTS truck_entrance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Report type
  report_type TEXT NOT NULL CHECK (report_type IN ('new', 'confirm', 'update', 'incorrect')),

  -- Entrance details
  entrance_different BOOLEAN NOT NULL,
  entrance_address TEXT,
  entrance_lat DECIMAL(10,8),
  entrance_lng DECIMAL(11,8),
  entrance_notes TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_truck_entrance_reports_facility ON truck_entrance_reports(facility_id);
CREATE INDEX IF NOT EXISTS idx_truck_entrance_reports_user ON truck_entrance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_facilities_truck_entrance ON facilities(truck_entrance_different) WHERE truck_entrance_different = TRUE;

-- RLS policies
ALTER TABLE truck_entrance_reports ENABLE ROW LEVEL SECURITY;

-- Users can create their own reports
CREATE POLICY "Users can create entrance reports"
  ON truck_entrance_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can view all entrance reports (crowdsourced data is public)
CREATE POLICY "Anyone can view entrance reports"
  ON truck_entrance_reports FOR SELECT
  USING (TRUE);

-- Users can update their own unverified reports
CREATE POLICY "Users can update own unverified reports"
  ON truck_entrance_reports FOR UPDATE
  USING (user_id = auth.uid() AND is_verified = FALSE);

-- ============================================================================
-- Function: Update facility truck entrance from reports
-- ============================================================================

CREATE OR REPLACE FUNCTION update_facility_truck_entrance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process 'new', 'confirm', or 'update' reports
  IF NEW.report_type IN ('new', 'confirm', 'update') AND NEW.entrance_different = TRUE THEN
    -- Update the facility
    UPDATE facilities
    SET
      truck_entrance_different = TRUE,
      truck_entrance_address = COALESCE(NEW.entrance_address, truck_entrance_address),
      truck_entrance_lat = COALESCE(NEW.entrance_lat, truck_entrance_lat),
      truck_entrance_lng = COALESCE(NEW.entrance_lng, truck_entrance_lng),
      truck_entrance_notes = COALESCE(NEW.entrance_notes, truck_entrance_notes),
      truck_entrance_verified_count = truck_entrance_verified_count + 1,
      truck_entrance_last_updated_at = NOW(),
      truck_entrance_last_updated_by = NEW.user_id,
      updated_at = NOW()
    WHERE id = NEW.facility_id;
  END IF;

  -- Handle 'incorrect' reports - decrement count
  IF NEW.report_type = 'incorrect' THEN
    UPDATE facilities
    SET
      truck_entrance_verified_count = GREATEST(0, truck_entrance_verified_count - 1),
      updated_at = NOW()
    WHERE id = NEW.facility_id;

    -- If count reaches 0, clear the entrance info
    UPDATE facilities
    SET
      truck_entrance_different = FALSE,
      truck_entrance_address = NULL,
      truck_entrance_lat = NULL,
      truck_entrance_lng = NULL,
      truck_entrance_notes = NULL,
      truck_entrance_last_updated_at = NOW(),
      truck_entrance_last_updated_by = NEW.user_id
    WHERE id = NEW.facility_id
      AND truck_entrance_verified_count = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_facility_truck_entrance ON truck_entrance_reports;
CREATE TRIGGER trigger_update_facility_truck_entrance
  AFTER INSERT ON truck_entrance_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_facility_truck_entrance();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN facilities.truck_entrance_different IS 'Whether truck entrance is different from main address';
COMMENT ON COLUMN facilities.truck_entrance_address IS 'Address/description of truck entrance';
COMMENT ON COLUMN facilities.truck_entrance_lat IS 'Latitude of truck entrance';
COMMENT ON COLUMN facilities.truck_entrance_lng IS 'Longitude of truck entrance';
COMMENT ON COLUMN facilities.truck_entrance_notes IS 'Additional notes about truck entrance';
COMMENT ON COLUMN facilities.truck_entrance_verified_count IS 'Number of drivers who verified this entrance';

COMMENT ON TABLE truck_entrance_reports IS 'Crowdsourced truck entrance reports from drivers';
