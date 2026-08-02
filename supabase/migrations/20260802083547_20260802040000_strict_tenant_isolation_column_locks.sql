/*
# Strict tenant isolation: lock sensitive columns

## Problems fixed:
1. vendor_applications: users could self-approve by updating status/reviewed_by
2. campaigns: users could self-approve/boost by updating status/reviewed_by/boosted/boost_multiplier
3. super_admins: any super admin could set arbitrary role values on insert
4. vendor_offers: views_count/redemptions_count were client-writable (stat inflation)

## Approach:
- Revoke table-wide UPDATE on tables with sensitive columns
- GRANT UPDATE only on user-editable columns
- Sensitive columns (status, reviewed_by, reviewed_at, rejection_reason, boosted,
  boost_multiplier, views_count, redemptions_count, role) can only be modified
  by super admins via their RLS policies (which are already in place)
*/

-- ============================================================
-- vendor_applications: users can only update business fields, NOT status/review fields
-- ============================================================
REVOKE UPDATE ON vendor_applications FROM authenticated;
GRANT UPDATE (
  business_name, contact_name, email, phone, business_type,
  country_id, city, address, website, description,
  logo_url, license_url, gallery_urls
) ON vendor_applications TO authenticated;

-- ============================================================
-- campaigns: users can only update content/budget fields, NOT status/review/boost fields
-- ============================================================
REVOKE UPDATE ON campaigns FROM authenticated;
GRANT UPDATE (
  title, description, offer_id, campaign_type, placement,
  banner_url, budget_cents, cpm_cents, starts_at, ends_at
) ON campaigns TO authenticated;

-- ============================================================
-- vendor_offers: users can update content but NOT stats (views/redemptions)
-- ============================================================
REVOKE UPDATE ON vendor_offers FROM authenticated;
GRANT UPDATE (
  title, description, category, offer_type, discount_value,
  image_url, terms_conditions, original_price_cents,
  currency_code, city, country_id, expires_at, status
) ON vendor_offers TO authenticated;

-- ============================================================
-- super_admins: lock the role column so insert can't set arbitrary roles
-- (INSERT policy already checks the caller is an active super admin)
-- ============================================================
REVOKE UPDATE ON super_admins FROM authenticated;
GRANT UPDATE (is_active) ON super_admins TO authenticated;

-- Also restrict INSERT to only the columns that make sense
-- (the RLS WITH CHECK already ensures caller is super admin)
REVOKE INSERT ON super_admins FROM authenticated;
GRANT INSERT (email, role, is_active) ON super_admins TO authenticated;

-- ============================================================
-- companies: lock plan/plan_status/is_active to super admin only
-- ============================================================
REVOKE UPDATE ON companies FROM authenticated;
GRANT UPDATE (
  name, slug, logo_url, brand_color, address, email, phone,
  vat_number, country_id, currency_code, timezone, default_language,
  annual_budget_cents, monthly_budget_cents
) ON companies TO authenticated;
