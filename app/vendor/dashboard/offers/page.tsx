'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Eye, Ticket, Plus, ArrowRight } from 'lucide-react';
import { VendorDashboardLayout, VendorCreateOfferButton } from '@/components/vendor/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorOffer } from '@/lib/types';

export default function VendorOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<VendorOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

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

  const filtered = filter === 'all' ? offers : offers.filter((o) => o.status === filter);

  const filters = [
    { value: 'all' as const, label: 'All', count: offers.length },
    { value: 'published' as const, label: 'Published', count: offers.filter((o) => o.status === 'published').length },
    { value: 'draft' as const, label: 'Drafts', count: offers.filter((o) => o.status === 'draft').length },
    { value: 'archived' as const, label: 'Archived', count: offers.filter((o) => o.status === 'archived').length },
  ];

  return (
    <VendorDashboardLayout
      title="My Offers"
      subtitle="Create, edit, publish, and archive your offers."
      breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Offers' }]}
      actions={<VendorCreateOfferButton />}
    >
      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              filter === f.value
                ? 'bg-primary-gradient text-white shadow-glow'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card animate-pulse rounded-2xl p-6">
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No offers found"
          description={filter === 'all'
            ? "You haven't created any offers yet. Start by creating your first one."
            : `No ${filter} offers. Change the filter or create a new offer.`}
          action={{ label: 'Create Offer', href: '/vendor/dashboard/offers/new' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((offer) => (
            <Card key={offer.id} className="card-lift overflow-hidden">
              {offer.image_url ? (
                <img src={offer.image_url} alt={offer.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="grid h-40 w-full place-items-center bg-muted">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={
                    offer.status === 'published' ? 'border-success/30 bg-success/10 text-success' :
                    offer.status === 'draft' ? 'border-warning/30 bg-warning/10 text-warning' :
                    'border-muted bg-muted text-muted-foreground'
                  }>
                    {offer.status}
                  </Badge>
                  <span className="rounded-lg bg-primary-gradient px-2 py-0.5 text-xs font-bold text-white">
                    {offer.discount_value}
                  </span>
                </div>
                <h3 className="mt-2 truncate font-display text-sm font-bold">{offer.title}</h3>
                <p className="text-xs text-muted-foreground">{offer.category} • {offer.city}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {offer.views_count}</span>
                  <span className="flex items-center gap-1"><Ticket className="h-3.5 w-3.5" /> {offer.redemptions_count}</span>
                </div>
                <Link href={`/vendor/dashboard/offers/edit?id=${offer.id}`} className="mt-3 block">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Offer <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </VendorDashboardLayout>
  );
}
