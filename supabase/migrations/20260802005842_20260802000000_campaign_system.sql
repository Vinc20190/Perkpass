/*
# Campaign System + Vendor Document Storage

This migration creates the complete advertising/campaign management system
for the super-admin dashboard.

1. New Tables
   - `campaigns` — advertising campaigns created by vendors/partners
   - `banner_placements` — reusable banner slots managed by admin

2. Security
   - RLS enabled on both tables.
   - Campaigns: vendor can CRUD own; super admins can read/update all.
   - Published/active campaigns are publicly readable.
   - Banner placements: public read; super admin write only.

3. Indexes + seed data for default placements.
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendor_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  offer_id uuid REFERENCES vendor_offers(id) ON DELETE SET NULL,
  campaign_type text NOT NULL DEFAULT 'flash',
  placement text NOT NULL DEFAULT 'homepage_top',
  banner_url text,
  budget_cents bigint NOT NULL DEFAULT 0,
  spent_cents bigint NOT NULL DEFAULT 0,
  cpm_cents bigint NOT NULL DEFAULT 500,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  revenue_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  boosted boolean NOT NULL DEFAULT false,
  boost_multiplier real NOT NULL DEFAULT 1.0,
  starts_at timestamptz,
  ends_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banner_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  current_campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_placements ENABLE ROW LEVEL SECURITY;

-- Campaigns: public read active
DROP POLICY IF EXISTS "select_active_campaigns_public" ON campaigns;
CREATE POLICY "select_active_campaigns_public"
ON campaigns FOR SELECT TO anon, authenticated
USING (status = 'active' OR status = 'completed');

-- Campaigns: vendor reads own
DROP POLICY IF EXISTS "select_own_campaigns" ON campaigns;
CREATE POLICY "select_own_campaigns"
ON campaigns FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Campaigns: super admin reads all
DROP POLICY IF EXISTS "select_all_campaigns_admin" ON campaigns;
CREATE POLICY "select_all_campaigns_admin"
ON campaigns FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Campaigns: vendor inserts own
DROP POLICY IF EXISTS "insert_own_campaign" ON campaigns;
CREATE POLICY "insert_own_campaign"
ON campaigns FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Campaigns: vendor updates own
DROP POLICY IF EXISTS "update_own_campaign" ON campaigns;
CREATE POLICY "update_own_campaign"
ON campaigns FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Campaigns: super admin updates any
DROP POLICY IF EXISTS "update_campaign_admin" ON campaigns;
CREATE POLICY "update_campaign_admin"
ON campaigns FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Campaigns: vendor deletes own
DROP POLICY IF EXISTS "delete_own_campaign" ON campaigns;
CREATE POLICY "delete_own_campaign"
ON campaigns FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Campaigns: super admin deletes any
DROP POLICY IF EXISTS "delete_campaign_admin" ON campaigns;
CREATE POLICY "delete_campaign_admin"
ON campaigns FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Banner placements: public read active
DROP POLICY IF EXISTS "select_banner_placements_public" ON banner_placements;
CREATE POLICY "select_banner_placements_public"
ON banner_placements FOR SELECT TO anon, authenticated
USING (is_active = true);

-- Banner placements: super admin reads all
DROP POLICY IF EXISTS "select_all_banner_placements_admin" ON banner_placements;
CREATE POLICY "select_all_banner_placements_admin"
ON banner_placements FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Banner placements: super admin inserts
DROP POLICY IF EXISTS "insert_banner_placement_admin" ON banner_placements;
CREATE POLICY "insert_banner_placement_admin"
ON banner_placements FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Banner placements: super admin updates
DROP POLICY IF EXISTS "update_banner_placement_admin" ON banner_placements;
CREATE POLICY "update_banner_placement_admin"
ON banner_placements FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_vendor ON campaigns(vendor_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_placement ON campaigns(placement);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_banner_placements_slot ON banner_placements(slot_key);

INSERT INTO banner_placements (slot_key, display_name, description, is_active)
VALUES
  ('homepage_top', 'Homepage Top Banner', 'Primary banner shown at the top of the homepage', true),
  ('search_sidebar', 'Search Sidebar Banner', 'Banner shown in the search results sidebar', true),
  ('category_top', 'Category Top Banner', 'Banner shown at the top of category pages', true),
  ('flash_deals', 'Flash Deals Section', 'Rotating flash deal banners on the homepage', true)
ON CONFLICT (slot_key) DO NOTHING;
