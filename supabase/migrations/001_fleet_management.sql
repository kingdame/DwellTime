-- ===========================================
-- DwellTime Fleet Management Migration
-- Migration: 001_fleet_management
-- Created: 2026-01-12
-- Description: Adds fleet management tables, relationships, and RLS policies
-- ===========================================

-- ===========================================
-- 1. CREATE FLEETS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS fleets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  dot_number TEXT,
  mc_number TEXT,
  billing_email TEXT,
  max_drivers INTEGER DEFAULT 10,
  subscription_tier TEXT CHECK (subscription_tier IN ('small_fleet', 'fleet', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  subscription_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for table documentation
COMMENT ON TABLE fleets IS 'Fleet organizations that can have multiple drivers and consolidated billing';

-- ===========================================
-- 2. CREATE FLEET_MEMBERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS fleet_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  settings_override JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fleet_id, user_id)
);

COMMENT ON TABLE fleet_members IS 'Tracks membership of users in fleets with role and status';

-- ===========================================
-- 3. CREATE FLEET_INVITATIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS fleet_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  invitation_code TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'driver' CHECK (role IN ('admin', 'driver')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fleet_invitations IS 'Pending invitations for drivers to join fleets';

-- ===========================================
-- 4. CREATE FLEET_INVOICES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS fleet_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_ids UUID[] NOT NULL DEFAULT '{}',
  detention_event_ids UUID[] NOT NULL DEFAULT '{}',
  driver_ids UUID[] NOT NULL DEFAULT '{}',
  recipient_name TEXT,
  recipient_company TEXT,
  recipient_email TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid')),
  date_range_start DATE,
  date_range_end DATE,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fleet_invoices IS 'Consolidated invoices for fleet detention events across multiple drivers';

-- ===========================================
-- 5. ALTER EXISTING TABLES
-- ===========================================

-- 5.1 Add fleet-related columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fleet_role TEXT CHECK (fleet_role IN ('admin', 'driver'));

-- Note: Some columns may already exist based on initial schema
-- Using DO block for conditional column adds
DO $$
BEGIN
  -- Add stripe_customer_id if not exists (may already exist)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;

  -- Add subscription_status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT
      CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid'));
  END IF;

  -- Add subscription_period_end if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'subscription_period_end') THEN
    ALTER TABLE users ADD COLUMN subscription_period_end TIMESTAMPTZ;
  END IF;
END $$;

COMMENT ON COLUMN users.current_fleet_id IS 'The fleet this user is currently associated with';
COMMENT ON COLUMN users.fleet_role IS 'Role within current fleet (admin or driver)';

-- 5.2 Add fleet-related columns to detention_events table
ALTER TABLE detention_events
  ADD COLUMN IF NOT EXISTS fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fleet_visible BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN detention_events.fleet_id IS 'Fleet this event belongs to (null for individual drivers)';
COMMENT ON COLUMN detention_events.fleet_visible IS 'Whether this event is visible to fleet admins';

-- 5.3 Add fleet-related columns to invoices table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    -- Add fleet_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'fleet_id') THEN
      ALTER TABLE invoices ADD COLUMN fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL;
    END IF;

    -- Add fleet_invoice_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'fleet_invoice_id') THEN
      ALTER TABLE invoices ADD COLUMN fleet_invoice_id UUID REFERENCES fleet_invoices(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ===========================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ===========================================

-- Fleets indexes
CREATE INDEX IF NOT EXISTS idx_fleets_owner ON fleets(owner_id);
CREATE INDEX IF NOT EXISTS idx_fleets_subscription_status ON fleets(subscription_status);
CREATE INDEX IF NOT EXISTS idx_fleets_stripe_customer ON fleets(stripe_customer_id);

-- Fleet members indexes
CREATE INDEX IF NOT EXISTS idx_fleet_members_fleet ON fleet_members(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleet_members_user ON fleet_members(user_id);
CREATE INDEX IF NOT EXISTS idx_fleet_members_status ON fleet_members(status);
CREATE INDEX IF NOT EXISTS idx_fleet_members_role ON fleet_members(role);
CREATE INDEX IF NOT EXISTS idx_fleet_members_fleet_status ON fleet_members(fleet_id, status);

-- Fleet invitations indexes
CREATE INDEX IF NOT EXISTS idx_fleet_invitations_fleet ON fleet_invitations(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleet_invitations_email ON fleet_invitations(email);
CREATE INDEX IF NOT EXISTS idx_fleet_invitations_code ON fleet_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_fleet_invitations_expires ON fleet_invitations(expires_at);

-- Fleet invoices indexes
CREATE INDEX IF NOT EXISTS idx_fleet_invoices_fleet ON fleet_invoices(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleet_invoices_status ON fleet_invoices(status);
CREATE INDEX IF NOT EXISTS idx_fleet_invoices_created_by ON fleet_invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_fleet_invoices_date_range ON fleet_invoices(date_range_start, date_range_end);

-- Users fleet indexes (for new columns)
CREATE INDEX IF NOT EXISTS idx_users_current_fleet ON users(current_fleet_id);

-- Detention events fleet indexes
CREATE INDEX IF NOT EXISTS idx_detention_events_fleet ON detention_events(fleet_id);
CREATE INDEX IF NOT EXISTS idx_detention_events_fleet_visible ON detention_events(fleet_id, fleet_visible)
  WHERE fleet_visible = TRUE;

-- ===========================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE fleets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_invoices ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 8. CREATE RLS POLICIES
-- ===========================================

-- ----------------------------------------
-- 8.1 FLEETS POLICIES
-- ----------------------------------------

-- Fleet owners can do everything with their fleets
CREATE POLICY "Fleet owners can manage their fleets"
  ON fleets
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Fleet members can view their fleets
CREATE POLICY "Fleet members can view their fleets"
  ON fleets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fleet_members
      WHERE fleet_members.fleet_id = fleets.id
        AND fleet_members.user_id = auth.uid()
        AND fleet_members.status = 'active'
    )
  );

-- ----------------------------------------
-- 8.2 FLEET_MEMBERS POLICIES
-- ----------------------------------------

-- Fleet admins can manage fleet members
CREATE POLICY "Fleet admins can manage members"
  ON fleet_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fleets
      WHERE fleets.id = fleet_members.fleet_id
        AND fleets.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fleet_members fm
      WHERE fm.fleet_id = fleet_members.fleet_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fleets
      WHERE fleets.id = fleet_members.fleet_id
        AND fleets.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fleet_members fm
      WHERE fm.fleet_id = fleet_members.fleet_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
  );

-- Members can view their own membership
CREATE POLICY "Members can view own membership"
  ON fleet_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Members can update their own settings
CREATE POLICY "Members can update own settings"
  ON fleet_members
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------
-- 8.3 FLEET_INVITATIONS POLICIES
-- ----------------------------------------

-- Fleet admins can manage invitations
CREATE POLICY "Fleet admins can manage invitations"
  ON fleet_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fleets
      WHERE fleets.id = fleet_invitations.fleet_id
        AND fleets.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fleet_members
      WHERE fleet_members.fleet_id = fleet_invitations.fleet_id
        AND fleet_members.user_id = auth.uid()
        AND fleet_members.role = 'admin'
        AND fleet_members.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fleets
      WHERE fleets.id = fleet_invitations.fleet_id
        AND fleets.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fleet_members
      WHERE fleet_members.fleet_id = fleet_invitations.fleet_id
        AND fleet_members.user_id = auth.uid()
        AND fleet_members.role = 'admin'
        AND fleet_members.status = 'active'
    )
  );

-- Users can view invitations sent to their email (for accepting)
CREATE POLICY "Users can view invitations for their email"
  ON fleet_invitations
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND accepted_at IS NULL
    AND expires_at > NOW()
  );

-- ----------------------------------------
-- 8.4 FLEET_INVOICES POLICIES
-- ----------------------------------------

-- Fleet admins can manage fleet invoices
CREATE POLICY "Fleet admins can manage fleet invoices"
  ON fleet_invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fleets
      WHERE fleets.id = fleet_invoices.fleet_id
        AND fleets.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fleet_members
      WHERE fleet_members.fleet_id = fleet_invoices.fleet_id
        AND fleet_members.user_id = auth.uid()
        AND fleet_members.role = 'admin'
        AND fleet_members.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fleets
      WHERE fleets.id = fleet_invoices.fleet_id
        AND fleets.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM fleet_members
      WHERE fleet_members.fleet_id = fleet_invoices.fleet_id
        AND fleet_members.user_id = auth.uid()
        AND fleet_members.role = 'admin'
        AND fleet_members.status = 'active'
    )
  );

-- Drivers can view fleet invoices that include their events
CREATE POLICY "Drivers can view fleet invoices containing their events"
  ON fleet_invoices
  FOR SELECT
  USING (
    auth.uid() = ANY(driver_ids)
    AND EXISTS (
      SELECT 1 FROM fleet_members
      WHERE fleet_members.fleet_id = fleet_invoices.fleet_id
        AND fleet_members.user_id = auth.uid()
        AND fleet_members.status = 'active'
    )
  );

-- ----------------------------------------
-- 8.5 DETENTION_EVENTS FLEET POLICIES
-- ----------------------------------------

-- Drop existing policies if they conflict (use DO block for safety)
DO $$
BEGIN
  -- We'll add new fleet-aware policies without dropping existing ones
  -- The new policies will work alongside existing user-based policies
END $$;

-- Fleet admins can VIEW driver detention events (READ-ONLY)
CREATE POLICY "Fleet admins can view driver detention events"
  ON detention_events
  FOR SELECT
  USING (
    fleet_visible = TRUE
    AND fleet_id IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM fleets
        WHERE fleets.id = detention_events.fleet_id
          AND fleets.owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM fleet_members
        WHERE fleet_members.fleet_id = detention_events.fleet_id
          AND fleet_members.user_id = auth.uid()
          AND fleet_members.role = 'admin'
          AND fleet_members.status = 'active'
      )
    )
  );

-- ----------------------------------------
-- 8.6 USERS FLEET POLICIES (Additional)
-- ----------------------------------------

-- Fleet admins can view basic info of their drivers
CREATE POLICY "Fleet admins can view driver profiles"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fleet_members fm
      JOIN fleets f ON f.id = fm.fleet_id
      WHERE fm.user_id = users.id
        AND fm.status = 'active'
        AND (
          f.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM fleet_members admin_fm
            WHERE admin_fm.fleet_id = fm.fleet_id
              AND admin_fm.user_id = auth.uid()
              AND admin_fm.role = 'admin'
              AND admin_fm.status = 'active'
          )
        )
    )
  );

-- ===========================================
-- 9. CREATE UPDATED_AT TRIGGERS
-- ===========================================

-- Ensure the trigger function exists (may already exist from initial schema)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new tables
CREATE TRIGGER update_fleets_updated_at
  BEFORE UPDATE ON fleets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_members_updated_at
  BEFORE UPDATE ON fleet_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_invoices_updated_at
  BEFORE UPDATE ON fleet_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 10. HELPER FUNCTIONS
-- ===========================================

-- Function to check if user is fleet admin
CREATE OR REPLACE FUNCTION is_fleet_admin(p_fleet_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM fleets WHERE id = p_fleet_id AND owner_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM fleet_members
    WHERE fleet_id = p_fleet_id
      AND user_id = p_user_id
      AND role = 'admin'
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is fleet member
CREATE OR REPLACE FUNCTION is_fleet_member(p_fleet_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM fleet_members
    WHERE fleet_id = p_fleet_id
      AND user_id = p_user_id
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active fleet
CREATE OR REPLACE FUNCTION get_user_fleet(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_fleet_id UUID;
BEGIN
  SELECT current_fleet_id INTO v_fleet_id
  FROM users
  WHERE id = p_user_id;

  RETURN v_fleet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to count active fleet members
CREATE OR REPLACE FUNCTION get_fleet_member_count(p_fleet_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM fleet_members
    WHERE fleet_id = p_fleet_id
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 11. ADD CONSTRAINTS
-- ===========================================

-- Ensure fleet owner is automatically an admin member
-- This is handled by application logic, but we add a check constraint
-- to ensure the owner's membership cannot be removed

-- Function to prevent owner removal
CREATE OR REPLACE FUNCTION prevent_owner_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'removed') THEN
    IF EXISTS (
      SELECT 1 FROM fleets
      WHERE id = OLD.fleet_id AND owner_id = OLD.user_id
    ) THEN
      RAISE EXCEPTION 'Cannot remove or deactivate fleet owner from membership';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_owner_removal_trigger
  BEFORE UPDATE OR DELETE ON fleet_members
  FOR EACH ROW EXECUTE FUNCTION prevent_owner_removal();

-- ===========================================
-- 12. GRANT PERMISSIONS
-- ===========================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION is_fleet_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_fleet_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_fleet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_fleet_member_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invitation_code() TO authenticated;

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
