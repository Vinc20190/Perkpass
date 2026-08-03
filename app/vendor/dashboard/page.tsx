'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Ticket, Tag, TrendingUp, ArrowRight } from 'lucide-react';
import { VendorDashboardLayout, VendorCreateOfferButton } from '@/components/vendor/dashboard-layout';
import { StatCard, SectionHeading } from '@/components/ui/primitives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorOffer } from '@/lib/types';

export default function VendorDashboardOverview() {
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
        .order('created_at', { ascending: false });
      setOffers((data ?? []) as VendorOffer[]);
      setLoading(false);
    })();
  }, [user]);

  const totalViews = offers.reduce((s, o) => s + o.views_count, 0);
  const totalRedemptions = offers.reduce((s, o) => s + o.redemptions_count, 0);
  const publishedCount = offers.filter((o) => o.status === 'published').length;

  const recentOffers = offers.slice(0, 5);

  return (
    <VendorDashboardLayout
      title="Dashboard Overview"
      subtitle="Welcome back! Here's how your offers are performing."
      breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard' }]}
      actions={<VendorCreateOfferButton />}
    >
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Offers" value={offers.length} icon={Tag} index={0} />
          <StatCard label="Published" value={publishedCount} icon={Ticket} index={1} />
          <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} index={2} />
          <StatCard label="Redemptions" value={totalRedemptions.toLocaleString()} icon={TrendingUp} index={3} />
        </div>

        {/* Recent offers */}
        <div>
          <SectionHeading title="Recent Offers" />
          {loading ? (
            <div className="glass-card animate-pulse rounded-2xl p-6">
              <div className="h-16 rounded-xl bg-muted" />
            </div>
          ) : recentOffers.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No offers yet. Create your first offer to get started.</p>
              <Link href="/vendor/dashboard/offers/new" className="mt-4 inline-block">
                <Button className="btn-shine bg-primary-gradient">
                  <Tag className="mr-2 h-4 w-4" /> Create First Offer
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOffers.map((offer) => (
                <Card key={offer.id} className="glass-card card-lift p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {offer.image_url ? (
                        <img src={offer.image_url} alt={offer.title} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10">
                          <Tag className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-bold">{offer.title}</p>
                        <p className="text-xs text-muted-foreground">{offer.category} • {offer.city}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {offer.views_count} views
                      </span>
                      <Badge variant="outline" className={
                        offer.status === 'published' ? 'border-success/30 bg-success/10 text-success' :
                        offer.status === 'draft' ? 'border-warning/30 bg-warning/10 text-warning' :
                        'border-muted bg-muted text-muted-foreground'
                      }>
                        {offer.status}
                      </Badge>
                      <Link href={`/vendor/dashboard/offers/edit?id=${offer.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/vendor/dashboard/offers">
            <Card className="glass-card card-lift flex items-center justify-between p-5">
              <div>
                <p className="font-display text-sm font-bold">Manage All Offers</p>
                <p className="text-xs text-muted-foreground">View, edit, and archive your offers</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </Card>
          </Link>
          <Link href="/vendor/dashboard/analytics">
            <Card className="glass-card card-lift flex items-center justify-between p-5">
              <div>
                <p className="font-display text-sm font-bold">View Analytics</p>
                <p className="text-xs text-muted-foreground">Track performance and conversions</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </Card>
          </Link>
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
