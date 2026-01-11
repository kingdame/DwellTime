-- Migration: Add verification_code to detention_events
-- This enables trustless verification for shippers

-- Add verification_code column
ALTER TABLE detention_events
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(8) UNIQUE;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_detention_events_verification_code
ON detention_events(verification_code);

-- Add evidence_hash for integrity verification (Phase 2)
ALTER TABLE detention_events
ADD COLUMN IF NOT EXISTS evidence_hash VARCHAR(64);

-- Update RLS policy to allow public read of verification data
-- (for the verification portal)
CREATE POLICY "Allow public read of verified events"
  ON detention_events
  FOR SELECT
  USING (
    verification_code IS NOT NULL
    AND status = 'completed'
  );

-- Comment explaining the verification system
COMMENT ON COLUMN detention_events.verification_code IS
  'Unique 8-character alphanumeric code for shipper verification';

COMMENT ON COLUMN detention_events.evidence_hash IS
  'SHA256 hash of GPS logs + timestamps + photos for evidence integrity';
