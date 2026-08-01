'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { VendorDashboardLayout } from '@/components/vendor/dashboard-layout';
import { VendorAnalyticsTable } from '@/components/ui/vendor-analytics-table';
import { StatCard } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorOffer } from '@/lib/types';

export default function VendorAnalyticsPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<VendorOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('vendor_offers')
        .select('*')
        .eq('user_id', user.id)
        .order('views_count', { ascending: false });
      setOffers((data ?? []) as VendorOffer[]);
      setLoading(false);
    })();
  }, [user]);

  const totalViews = offers.reduce((s, o) => s + o.views_count, 0);
  const totalRedemptions = offers.reduce((s, o) => s + o.redemptions_count, 0);
  const conversionRate = totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(1) : '0.0';
  const publishedCount = offers.filter((o) => o.status === 'published').length;

  return (
    <VendorDashboardLayout
      title="Analytics"
      subtitle="Track views, redemptions, and conversion rates for all your offers."
      breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Analytics' }]}
    >
      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={BarChart3} index={0} />
          <StatCard label="Redemptions" value={totalRedemptions.toLocaleString()} icon={BarChart3} index={1} />
          <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={BarChart3} index={2} />
          <StatCard label="Published Offers" value={publishedCount} icon={BarChart3} index={3} />
        </div>

        {/* Detailed table */}
        {loading ? (
          <div className="glass-card animate-pulse rounded-2xl p-6">
            <div className="h-64 rounded-xl bg-muted" />
          </div>
        ) : (
          <VendorAnalyticsTable offers={offers} />
        )}
      </div>
    </VendorDashboardLayout>
  );
}
