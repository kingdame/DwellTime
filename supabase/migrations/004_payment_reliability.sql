-- ============================================================================
-- Migration: Payment Reliability Tracking
-- Phase 7D: Track payment outcomes to build facility reliability scores
-- ============================================================================

-- Add payment tracking columns to facility_reviews
ALTER TABLE facility_reviews ADD COLUMN IF NOT EXISTS got_paid BOOLEAN;
ALTER TABLE facility_reviews ADD COLUMN IF NOT EXISTS payment_days INTEGER;
ALTER TABLE facility_reviews ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);
ALTER TABLE facility_reviews ADD COLUMN IF NOT EXISTS partial_payment BOOLEAN DEFAULT FALSE;
ALTER TABLE facility_reviews ADD COLUMN IF NOT EXISTS payment_reported_at TIMESTAMPTZ;

-- Add payment follow-up tracking to invoice_tracking
ALTER TABLE invoice_tracking ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE invoice_tracking ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMPTZ;
ALTER TABLE invoice_tracking ADD COLUMN IF NOT EXISTS follow_up_response TEXT CHECK (
  follow_up_response IN ('paid_full', 'paid_partial', 'not_paid', 'pending', 'disputed')
);
ALTER TABLE invoice_tracking ADD COLUMN IF NOT EXISTS follow_up_responded_at TIMESTAMPTZ;

-- Create payment follow-up queue table
CREATE TABLE IF NOT EXISTS payment_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  tracking_id UUID REFERENCES invoice_tracking(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response TEXT CHECK (response IN ('paid_full', 'paid_partial', 'not_paid', 'pending', 'disputed')),
  payment_amount DECIMAL(10,2),
  payment_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invoice_id)
);

-- Create facility payment stats materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS facility_payment_stats AS
SELECT
  f.id as facility_id,
  f.name as facility_name,
  COUNT(*) FILTER (WHERE fr.got_paid IS NOT NULL) as total_claims,
  COUNT(*) FILTER (WHERE fr.got_paid = TRUE) as paid_claims,
  COUNT(*) FILTER (WHERE fr.got_paid = FALSE) as unpaid_claims,
  ROUND(
    COUNT(*) FILTER (WHERE fr.got_paid = TRUE)::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE fr.got_paid IS NOT NULL), 0) * 100,
    1
  ) as payment_rate,
  ROUND(AVG(fr.payment_days) FILTER (WHERE fr.got_paid = TRUE), 1) as avg_payment_days,
  ROUND(AVG(fr.payment_amount) FILTER (WHERE fr.got_paid = TRUE), 2) as avg_payment_amount,
  COUNT(*) FILTER (WHERE fr.partial_payment = TRUE) as partial_payments,
  MAX(fr.payment_reported_at) as last_report_date
FROM facilities f
LEFT JOIN facility_reviews fr ON f.id = fr.facility_id AND fr.detention_event_id IS NOT NULL
GROUP BY f.id, f.name;

-- Create unique index for refreshing
CREATE UNIQUE INDEX IF NOT EXISTS facility_payment_stats_facility_id_idx
ON facility_payment_stats(facility_id);

-- Create function to refresh payment stats
CREATE OR REPLACE FUNCTION refresh_facility_payment_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY facility_payment_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh stats when reviews are updated
DROP TRIGGER IF EXISTS refresh_payment_stats_on_review ON facility_reviews;
CREATE TRIGGER refresh_payment_stats_on_review
  AFTER INSERT OR UPDATE OF got_paid, payment_days, payment_amount ON facility_reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_facility_payment_stats();

-- RLS policies for payment_follow_ups
ALTER TABLE payment_follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follow-ups"
  ON payment_follow_ups FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own follow-ups"
  ON payment_follow_ups FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own follow-ups"
  ON payment_follow_ups FOR UPDATE
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_follow_ups_user ON payment_follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_follow_ups_scheduled ON payment_follow_ups(scheduled_for)
  WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_follow_ups_pending ON payment_follow_ups(user_id, sent_at)
  WHERE responded_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_facility_reviews_payment ON facility_reviews(facility_id)
  WHERE got_paid IS NOT NULL;

-- Grant access to materialized view
GRANT SELECT ON facility_payment_stats TO authenticated;

-- Initial refresh of materialized view
REFRESH MATERIALIZED VIEW facility_payment_stats;
