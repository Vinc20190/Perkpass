'use client';

import { Eye, Ticket, TrendingUp, Star } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VendorOffer } from '@/lib/types';

interface VendorAnalyticsTableProps {
  offers: VendorOffer[];
  className?: string;
}

export function VendorAnalyticsTable({ offers, className }: VendorAnalyticsTableProps) {
  const totalViews = offers.reduce((s, o) => s + o.views_count, 0);
  const totalRedemptions = offers.reduce((s, o) => s + o.redemptions_count, 0);
  const conversionRate = totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className={cn('glass-card overflow-hidden rounded-2xl', className)}>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 border-b border-border p-4">
        <SummaryStat icon={Eye} label="Total Views" value={totalViews.toLocaleString()} />
        <SummaryStat icon={Ticket} label="Redemptions" value={totalRedemptions.toLocaleString()} />
        <SummaryStat icon={TrendingUp} label="Conversion" value={`${conversionRate}%`} />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold">Offer</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-center font-bold">Views</TableHead>
              <TableHead className="text-center font-bold">Redemptions</TableHead>
              <TableHead className="text-center font-bold">Conv. Rate</TableHead>
              <TableHead className="text-right font-bold">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No offers yet. Create your first offer to see analytics.
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => {
                const conv = offer.views_count > 0 ? (offer.redemptions_count / offer.views_count) * 100 : 0;
                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{offer.title}</span>
                        <span className="text-xs text-muted-foreground">{offer.category} • {offer.city}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        offer.status === 'published' ? 'border-success/30 bg-success/10 text-success' :
                        offer.status === 'draft' ? 'border-warning/30 bg-warning/10 text-warning' :
                        'border-muted bg-muted text-muted-foreground'
                      }>
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{offer.views_count.toLocaleString()}</TableCell>
                    <TableCell className="text-center font-semibold">{offer.redemptions_count.toLocaleString()}</TableCell>
                    <TableCell className="text-center font-semibold">{conv.toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary-gradient"
                            style={{ width: `${Math.min(100, conv * 2)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-xl font-extrabold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
