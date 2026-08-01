/*
# Vendor System — "Become a Vendor" module

This migration creates the complete vendor (partner/seller) system for PerkPass,
allowing partners to apply, get approved by an admin, and then manage their own
offers on the platform.

1. New Tables
   - `vendor_applications` — stores partner registration applications
     - `user_id` (uuid, defaults to auth.uid()) — the applicant
     - `business_name`, `contact_name`, `email`, `phone` — contact info
     - `business_type` (text) — e.g. restaurant, hotel, spa, retail
     - `country_id` (uuid FK → countries) — operating country
     - `city` (text) — primary city
     - `address` (text) — full business address
     - `website` (text, nullable) — optional business website
     - `description` (text, nullable) — business description
     - `logo_url` (text, nullable) — uploaded logo URL
     - `license_url` (text, nullable) — commercial license document URL
     - `gallery_urls` (jsonb, nullable) — array of image URLs
     - `status` (text, default 'pending') — pending / approved / rejected
     - `reviewed_by` (uuid, nullable) — admin who reviewed
     - `reviewed_at` (timestamptz, nullable) — when reviewed
     - `rejection_reason` (text, nullable) — reason if rejected
     - `created_at`, `updated_at` (timestamptz)

   - `vendor_offers` — offers created by approved vendors
     - `vendor_id` (uuid FK → vendor_applications.id ON DELETE CASCADE)
     - `user_id` (uuid, defaults to auth.uid()) — the vendor owner
     - `title`, `description` (text)
     - `category` (text) — dining, hotels, spa, etc.
     - `offer_type` (text) — discount / bogo / free
     - `discount_value` (text) — e.g. "40%", "BOGO", "Free coffee"
     - `image_url` (text, nullable)
     - `terms_conditions` (text, nullable)
     - `original_price_cents` (bigint, nullable)
     - `currency_code` (char(3), default 'USD')
     - `city` (text)
     - `country_id` (uuid FK → countries)
     - `expires_at` (timestamptz, nullable)
     - `status` (text, default 'draft') — draft / published / archived
     - `views_count` (integer, default 0)
     - `redemptions_count` (integer, default 0)
     - `created_at`, `updated_at` (timestamptz)

2. Security
   - RLS enabled on both tables.
   - vendor_applications: applicant can read/update own application;
     super admins can read all and update status (via super_admins check).
   - vendor_offers: vendor can CRUD own offers; anyone can read published offers.
   - All policies use auth.uid() for ownership checks.

3. Indexes
   - vendor_applications: user_id, status
   - vendor_offers: vendor_id, status, category

4. Important Notes
   - Admin approval flow: admin sets status='approved' or 'rejected' via
     the super-admin dashboard.
   - Once approved, the vendor can create offers in vendor_offers.
   - Published offers are publicly readable (TO anon, authenticated) so
     the homepage and browse pages can display them.
*/

-- ============================================================
-- TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  business_type text NOT NULL DEFAULT 'restaurant',
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  city text NOT NULL,
  address text,
  website text,
  description text,
  logo_url text,
  license_url text,
  gallery_urls jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendor_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'dining',
  offer_type text NOT NULL DEFAULT 'discount',
  discount_value text NOT NULL DEFAULT '10% OFF',
  image_url text,
  terms_conditions text,
  original_price_cents bigint DEFAULT 0,
  currency_code char(3) NOT NULL DEFAULT 'USD',
  city text NOT NULL,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  views_count integer NOT NULL DEFAULT 0,
  redemptions_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS ENABLE
-- ============================================================
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_offers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: vendor_applications
-- ============================================================

-- Applicant can read their own application(s)
DROP POLICY IF EXISTS "select_own_vendor_app" ON vendor_applications;
CREATE POLICY "select_own_vendor_app"
ON vendor_applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Super admins can read all applications
DROP POLICY IF EXISTS "select_all_vendor_apps_admin" ON vendor_applications;
CREATE POLICY "select_all_vendor_apps_admin"
ON vendor_applications FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Applicant can insert their own application
DROP POLICY IF EXISTS "insert_own_vendor_app" ON vendor_applications;
CREATE POLICY "insert_own_vendor_app"
ON vendor_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Applicant can update their own application (only while pending)
DROP POLICY IF EXISTS "update_own_vendor_app" ON vendor_applications;
CREATE POLICY "update_own_vendor_app"
ON vendor_applications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Super admins can update application status (approve/reject)
DROP POLICY IF EXISTS "update_vendor_app_admin" ON vendor_applications;
CREATE POLICY "update_vendor_app_admin"
ON vendor_applications FOR UPDATE TO authenticated
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

-- ============================================================
-- POLICIES: vendor_offers
-- ============================================================

-- Public can read published offers (for browsing the marketplace)
DROP POLICY IF EXISTS "select_published_vendor_offers" ON vendor_offers;
CREATE POLICY "select_published_vendor_offers"
ON vendor_offers FOR SELECT TO anon, authenticated
USING (status = 'published');

-- Vendor can read all their own offers (including drafts/archived)
DROP POLICY IF EXISTS "select_own_vendor_offers" ON vendor_offers;
CREATE POLICY "select_own_vendor_offers"
ON vendor_offers FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Super admins can read all vendor offers
DROP POLICY IF EXISTS "select_all_vendor_offers_admin" ON vendor_offers;
CREATE POLICY "select_all_vendor_offers_admin"
ON vendor_offers FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM super_admins sa
    WHERE sa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sa.is_active = true)
);

-- Vendor can insert their own offers (must have an approved application)
DROP POLICY IF EXISTS "insert_own_vendor_offer" ON vendor_offers;
CREATE POLICY "insert_own_vendor_offer"
ON vendor_offers FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM vendor_applications va
    WHERE va.user_id = auth.uid() AND va.status = 'approved'
  )
);

-- Vendor can update their own offers
DROP POLICY IF EXISTS "update_own_vendor_offer" ON vendor_offers;
CREATE POLICY "update_own_vendor_offer"
ON vendor_offers FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Vendor can delete their own offers
DROP POLICY IF EXISTS "delete_own_vendor_offer" ON vendor_offers;
CREATE POLICY "delete_own_vendor_offer"
ON vendor_offers FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Super admins can update any vendor offer
DROP POLICY IF EXISTS "update_vendor_offer_admin" ON vendor_offers;
CREATE POLICY "update_vendor_offer_admin"
ON vendor_offers FOR UPDATE TO authenticated
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

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vendor_apps_user ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_apps_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_offers_vendor ON vendor_offers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_offers_status ON vendor_offers(status);
CREATE INDEX IF NOT EXISTS idx_vendor_offers_category ON vendor_offers(category);
CREATE INDEX IF NOT EXISTS idx_vendor_offers_city ON vendor_offers(city);
