'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';
import { VendorDashboardLayout } from '@/components/vendor/dashboard-layout';
import { OfferEditor, type OfferEditorData } from '@/components/ui/offer-editor';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorOffer } from '@/lib/types';

function EditOfferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const offerId = searchParams.get('id');
  const [offer, setOffer] = useState<VendorOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !offerId) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('vendor_offers')
        .select('*')
        .eq('id', offerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setOffer(data as VendorOffer);
      setLoading(false);
    })();
  }, [user, offerId]);

  const handleSave = async (data: OfferEditorData, _publish: boolean) => {
    setError(null);
    const { error: err } = await supabase
      .from('vendor_offers')
      .update({
        title: data.title,
        description: data.description || null,
        category: data.category,
        offer_type: data.offer_type,
        discount_value: data.discount_value,
        image_url: data.image_url || null,
        terms_conditions: data.terms_conditions || null,
        original_price_cents: data.original_price_cents,
        expires_at: data.expires_at || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId);

    if (err) {
      setError(err.message);
      return;
    }

    router.push('/vendor/dashboard/offers');
  };

  const handleDelete = async () => {
    await supabase.from('vendor_offers').delete().eq('id', offerId);
    router.push('/vendor/dashboard/offers');
  };

  if (loading) {
    return (
      <VendorDashboardLayout
        title="Edit Offer"
        breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Offers', href: '/vendor/dashboard/offers' }, { label: 'Edit' }]}
      >
        <div className="glass-card animate-pulse rounded-2xl p-6">
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </VendorDashboardLayout>
    );
  }

  if (!offer) {
    return (
      <VendorDashboardLayout
        title="Offer Not Found"
        breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Offers', href: '/vendor/dashboard/offers' }, { label: 'Edit' }]}
      >
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">This offer could not be found or you don&apos;t have access to it.</p>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout
      title="Edit Offer"
      subtitle="Update your offer details and publish or archive."
      breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Offers', href: '/vendor/dashboard/offers' }, { label: 'Edit' }]}
    >
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      <OfferEditor
        initialData={{
          id: offer.id,
          title: offer.title,
          description: offer.description ?? '',
          category: offer.category,
          offer_type: offer.offer_type,
          discount_value: offer.discount_value,
          image_url: offer.image_url ?? '',
          terms_conditions: offer.terms_conditions ?? '',
          original_price_cents: offer.original_price_cents,
          city: offer.city,
          expires_at: offer.expires_at ?? '',
          status: offer.status,
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => router.push('/vendor/dashboard/offers')}
      />
    </VendorDashboardLayout>
  );
}

export default function EditOfferPage() {
  return (
    <Suspense fallback={
      <VendorDashboardLayout title="Edit Offer" breadcrumbs={[]}>
        <div className="glass-card animate-pulse rounded-2xl p-6">
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </VendorDashboardLayout>
    }>
      <EditOfferContent />
    </Suspense>
  );
}
