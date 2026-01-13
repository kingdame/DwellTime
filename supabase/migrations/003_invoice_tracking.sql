-- Migration: Invoice Tracking & Recovery Dashboard
-- Phase 7C: Invoice aging, payment tracking, and ROI calculation

-- Invoice tracking table for payment status and aging
CREATE TABLE invoice_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invoice details snapshot
  amount_invoiced DECIMAL(10,2) NOT NULL,
  amount_received DECIMAL(10,2) DEFAULT 0,

  -- Payment tracking
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'partial', 'paid', 'disputed', 'written_off')
  ),
  payment_received_at TIMESTAMPTZ,
  days_to_payment INTEGER,

  -- Follow-up tracking
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  next_reminder_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(invoice_id)
);

-- Add sent_at column to invoices if not exists
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX idx_invoice_tracking_user ON invoice_tracking(user_id);
CREATE INDEX idx_invoice_tracking_status ON invoice_tracking(payment_status);
CREATE INDEX idx_invoice_tracking_next_reminder ON invoice_tracking(next_reminder_at)
  WHERE next_reminder_at IS NOT NULL;

-- RLS policies
ALTER TABLE invoice_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice tracking"
  ON invoice_tracking FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own invoice tracking"
  ON invoice_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoice tracking"
  ON invoice_tracking FOR UPDATE
  USING (user_id = auth.uid());

-- Function to calculate days to payment when marked as paid
CREATE OR REPLACE FUNCTION calculate_days_to_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    -- Get the invoice sent_at date
    SELECT
      EXTRACT(DAY FROM (NOW() - i.sent_at))::INTEGER
    INTO NEW.days_to_payment
    FROM invoices i
    WHERE i.id = NEW.invoice_id;

    NEW.payment_received_at = NOW();
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invoice_tracking_update
  BEFORE UPDATE ON invoice_tracking
  FOR EACH ROW
  EXECUTE FUNCTION calculate_days_to_payment();

-- Function to auto-create tracking record when invoice is sent
CREATE OR REPLACE FUNCTION create_invoice_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    INSERT INTO invoice_tracking (invoice_id, user_id, amount_invoiced, next_reminder_at)
    VALUES (
      NEW.id,
      NEW.user_id,
      NEW.total_amount,
      NEW.sent_at + INTERVAL '14 days'
    )
    ON CONFLICT (invoice_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_invoice_sent
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION create_invoice_tracking();

-- View for recovery statistics
CREATE OR REPLACE VIEW recovery_stats AS
SELECT
  user_id,
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_count,
  COUNT(*) FILTER (WHERE payment_status = 'partial') as partial_count,
  SUM(amount_invoiced) as total_invoiced,
  SUM(amount_received) as total_received,
  SUM(amount_invoiced) FILTER (WHERE payment_status = 'pending') as pending_amount,
  SUM(amount_invoiced) FILTER (WHERE payment_status = 'paid') as paid_amount,
  ROUND(
    (SUM(amount_received) / NULLIF(SUM(amount_invoiced), 0)) * 100, 1
  ) as collection_rate,
  ROUND(AVG(days_to_payment) FILTER (WHERE days_to_payment IS NOT NULL), 1) as avg_days_to_payment
FROM invoice_tracking
GROUP BY user_id;
