export type CompanyRole = 'owner' | 'admin' | 'hr' | 'manager' | 'employee';

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  vat_number: string | null;
  country_id: string | null;
  currency_code: string;
  timezone: string;
  default_language: string;
  annual_budget_cents: number;
  monthly_budget_cents: number;
  plan: string;
  plan_status: string;
  trial_ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  head_user_id: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  user_id: string | null;
  department_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  hired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardCatalogItem {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  value_cents: number;
  currency_code: string;
  expires_at: string | null;
  conditions: string | null;
  stock: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface RewardAssignment {
  id: string;
  company_id: string;
  reward_id: string;
  employee_id: string;
  assigned_by: string | null;
  status: 'available' | 'used' | 'expired' | 'cancelled' | 'scheduled';
  qr_token: string;
  short_code: string;
  value_cents: number;
  currency_code: string;
  message: string | null;
  scheduled_for: string | null;
  expires_at: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  company_id: string | null;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Country {
  id: string;
  iso_code: string;
  name: string;
  region: string;
  currency_code: string;
  currency_symbol: string;
  locale: string;
  phone_prefix: string | null;
  flag_emoji: string | null;
  is_active: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

// ============================================================
// Vendor System Types
// ============================================================

export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface VendorApplication {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_type: string;
  country_id: string | null;
  city: string;
  address: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  license_url: string | null;
  gallery_urls: string[] | null;
  status: VendorApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type VendorOfferStatus = 'draft' | 'published' | 'archived';
export type VendorOfferType = 'discount' | 'bogo' | 'free';

export interface VendorOffer {
  id: string;
  vendor_id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  offer_type: VendorOfferType;
  discount_value: string;
  image_url: string | null;
  terms_conditions: string | null;
  original_price_cents: number;
  currency_code: string;
  city: string;
  country_id: string | null;
  expires_at: string | null;
  status: VendorOfferStatus;
  views_count: number;
  redemptions_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Campaign System Types
// ============================================================

export type CampaignStatus = 'pending' | 'active' | 'rejected' | 'paused' | 'completed' | 'refunded';
export type CampaignType = 'flash' | 'homepage_banner' | 'search_banner' | 'category_banner';

export interface Campaign {
  id: string;
  vendor_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  offer_id: string | null;
  campaign_type: CampaignType;
  placement: string;
  banner_url: string | null;
  budget_cents: number;
  spent_cents: number;
  cpm_cents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_cents: number;
  status: CampaignStatus;
  rejection_reason: string | null;
  boosted: boolean;
  boost_multiplier: number;
  starts_at: string | null;
  ends_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BannerPlacement {
  id: string;
  slot_key: string;
  display_name: string;
  description: string | null;
  current_campaign_id: string | null;
  is_active: boolean;
  created_at: string;
}
