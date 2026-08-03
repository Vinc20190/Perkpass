-- Storage buckets for tenant-isolated file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
  ('vendor-assets', 'vendor-assets', true),
  ('company-assets', 'company-assets', true),
  ('reward-images', 'reward-images', true),
  ('offer-images', 'offer-images', true)
ON CONFLICT (id) DO NOTHING;

-- Helper: get current user email
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Helper: is current user a super admin?
CREATE OR REPLACE FUNCTION public.is_current_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins sa
    WHERE sa.email = public.current_user_email() AND sa.is_active = true
  );
$$;

-- Helper: get current user's company_id
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Helper: get current user's vendor application id
CREATE OR REPLACE FUNCTION public.current_user_vendor_app_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT id FROM public.vendor_applications WHERE user_id = auth.uid() AND status = 'approved' LIMIT 1;
$$;

-- =============================================
-- Storage RLS policies: vendor-assets bucket
-- =============================================
CREATE POLICY "vendor_assets_read_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'vendor-assets');

CREATE POLICY "vendor_assets_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-assets'
    AND (storage.foldername(name))[1] = public.current_user_vendor_app_id()::text
  );

CREATE POLICY "vendor_assets_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (storage.foldername(name))[1] = public.current_user_vendor_app_id()::text
  );

CREATE POLICY "vendor_assets_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (storage.foldername(name))[1] = public.current_user_vendor_app_id()::text
  );

CREATE POLICY "vendor_assets_admin_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'vendor-assets' AND public.is_current_super_admin())
  WITH CHECK (bucket_id = 'vendor-assets' AND public.is_current_super_admin());

-- =============================================
-- Storage RLS policies: offer-images bucket
-- =============================================
CREATE POLICY "offer_images_read_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'offer-images');

CREATE POLICY "offer_images_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'offer-images'
    AND (storage.foldername(name))[1] = public.current_user_vendor_app_id()::text
  );

CREATE POLICY "offer_images_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'offer-images'
    AND (storage.foldername(name))[1] = public.current_user_vendor_app_id()::text
  );

CREATE POLICY "offer_images_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'offer-images'
    AND (storage.foldername(name))[1] = public.current_user_vendor_app_id()::text
  );

CREATE POLICY "offer_images_admin_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'offer-images' AND public.is_current_super_admin())
  WITH CHECK (bucket_id = 'offer-images' AND public.is_current_super_admin());

-- =============================================
-- Storage RLS policies: company-assets bucket
-- =============================================
CREATE POLICY "company_assets_read_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'company-assets');

CREATE POLICY "company_assets_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-assets'
    AND (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

CREATE POLICY "company_assets_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-assets'
    AND (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

CREATE POLICY "company_assets_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-assets'
    AND (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

CREATE POLICY "company_assets_admin_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'company-assets' AND public.is_current_super_admin())
  WITH CHECK (bucket_id = 'company-assets' AND public.is_current_super_admin());

-- =============================================
-- Storage RLS policies: reward-images bucket
-- =============================================
CREATE POLICY "reward_images_read_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'reward-images');

CREATE POLICY "reward_images_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reward-images'
    AND (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

CREATE POLICY "reward_images_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'reward-images'
    AND (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

CREATE POLICY "reward_images_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reward-images'
    AND (storage.foldername(name))[1] = public.current_user_company_id()::text
  );

CREATE POLICY "reward_images_admin_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'reward-images' AND public.is_current_super_admin())
  WITH CHECK (bucket_id = 'reward-images' AND public.is_current_super_admin());

-- =============================================
-- Payments table for Stripe integration
-- =============================================
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_subscriptions"
  ON public.company_subscriptions FOR SELECT
  TO authenticated
  USING (company_id = public.current_user_company_id());

CREATE POLICY "admin_all_subscriptions"
  ON public.company_subscriptions FOR ALL
  TO authenticated
  USING (public.is_current_super_admin())
  WITH CHECK (public.is_current_super_admin());

-- =============================================
-- Offer redemptions tracking table
-- =============================================
CREATE TABLE IF NOT EXISTS public.offer_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.vendor_offers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  company_id uuid,
  status text NOT NULL DEFAULT 'redeemed',
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_redemptions"
  ON public.offer_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "select_company_redemptions"
  ON public.offer_redemptions FOR SELECT
  TO authenticated
  USING (company_id = public.current_user_company_id());

CREATE POLICY "select_vendor_offer_redemptions"
  ON public.offer_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_offers vo
      WHERE vo.id = offer_id AND vo.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_all_redemptions"
  ON public.offer_redemptions FOR SELECT
  TO authenticated
  USING (public.is_current_super_admin());

CREATE POLICY "insert_own_redemptions"
  ON public.offer_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_offer_redemptions_offer_id ON public.offer_redemptions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_user_id ON public.offer_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON public.company_subscriptions(company_id);