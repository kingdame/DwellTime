-- Email Invoice Feature Migration
-- Phase 7B: Email contacts and invoice email tracking

-- Email contacts for quick-send to brokers/shippers
CREATE TABLE IF NOT EXISTS email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  contact_type TEXT CHECK (contact_type IN ('broker', 'shipper', 'dispatcher', 'other')),
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Email send log for tracking delivery status
CREATE TABLE IF NOT EXISTS invoice_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT DEFAULT 'initial' CHECK (email_type IN ('initial', 'reminder', 'follow_up')),
  subject TEXT,
  custom_message TEXT,
  message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'delivered')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts"
  ON email_contacts FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own email logs"
  ON invoice_emails FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own email logs"
  ON invoice_emails FOR INSERT WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_contacts_user ON email_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_contacts_use_count ON email_contacts(user_id, use_count DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_emails_invoice ON invoice_emails(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_emails_user ON invoice_emails(user_id);

-- Updated_at trigger for email_contacts
CREATE TRIGGER email_contacts_updated_at
  BEFORE UPDATE ON email_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
