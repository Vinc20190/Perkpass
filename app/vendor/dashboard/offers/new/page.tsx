'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { VendorDashboardLayout } from '@/components/vendor/dashboard-layout';
import { OfferEditor, type OfferEditorData } from '@/components/ui/offer-editor';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';

export default function NewOfferPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: OfferEditorData, _publish: boolean) => {
    setError(null);
    if (!user) return;

    const { data: vendorApp } = await supabase
      .from('vendor_applications')
      .select('id, country_id')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .maybeSingle();

    if (!vendorApp) {
      setError('Your vendor application must be approved before creating offers.');
      return;
    }

    const { error: err } = await supabase.from('vendor_offers').insert({
      vendor_id: vendorApp.id,
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      category: data.category,
      offer_type: data.offer_type,
      discount_value: data.discount_value,
      image_url: data.image_url || null,
      terms_conditions: data.terms_conditions || null,
      original_price_cents: data.original_price_cents,
      currency_code: 'USD',
      city: data.city,
      country_id: vendorApp.country_id,
      expires_at: data.expires_at || null,
      status: data.status,
    });

    if (err) {
      setError(err.message);
      return;
    }

    router.push('/vendor/dashboard/offers');
  };

  return (
    <VendorDashboardLayout
      title="Create New Offer"
      subtitle="Fill in the details below to create a new offer."
      breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Offers', href: '/vendor/dashboard/offers' }, { label: 'New' }]}
    >
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      <OfferEditor onSave={handleSave} onCancel={() => router.push('/vendor/dashboard/offers')} />
    </VendorDashboardLayout>
  );
}
