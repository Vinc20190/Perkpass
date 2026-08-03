-- Allow vendor application uploads using user_id as folder prefix
-- (before the vendor application is approved, there's no vendor_app_id yet)
CREATE OR REPLACE FUNCTION public.current_user_vendor_or_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT COALESCE(
    (SELECT id::text FROM public.vendor_applications WHERE user_id = auth.uid() AND status = 'approved' LIMIT 1),
    auth.uid()::text
  );
$$;

-- Drop the strict vendor_app_id policies and replace with user_id-aware ones
DROP POLICY IF EXISTS "vendor_assets_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "vendor_assets_update_own" ON storage.objects;
DROP POLICY IF EXISTS "vendor_assets_delete_own" ON storage.objects;

CREATE POLICY "vendor_assets_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-assets'
    AND (storage.foldername(name))[1] = public.current_user_vendor_or_user_id()
  );

CREATE POLICY "vendor_assets_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (storage.foldername(name))[1] = public.current_user_vendor_or_user_id()
  );

CREATE POLICY "vendor_assets_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (storage.foldername(name))[1] = public.current_user_vendor_or_user_id()
  );

-- Same for offer-images
DROP POLICY IF EXISTS "offer_images_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "offer_images_update_own" ON storage.objects;
DROP POLICY IF EXISTS "offer_images_delete_own" ON storage.objects;

CREATE POLICY "offer_images_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'offer-images'
    AND (storage.foldername(name))[1] = public.current_user_vendor_or_user_id()
  );

CREATE POLICY "offer_images_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'offer-images'
    AND (storage.foldername(name))[1] = public.current_user_vendor_or_user_id()
  );

CREATE POLICY "offer_images_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'offer-images'
    AND (storage.foldername(name))[1] = public.current_user_vendor_or_user_id()
  );
