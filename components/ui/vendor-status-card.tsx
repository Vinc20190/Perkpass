'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VendorApplication } from '@/lib/types';

interface VendorStatusCardProps {
  application: VendorApplication;
}

export function VendorStatusCard({ application }: VendorStatusCardProps) {
  const status = application.status;

  const config = {
    pending: {
      icon: Clock,
      title: 'Application Under Review',
      message: 'Our admin team is reviewing your application. This typically takes 2-3 business days.',
      color: 'text-warning',
      bg: 'bg-warning/10',
      ring: 'ring-warning/30',
    },
    approved: {
      icon: CheckCircle2,
      title: 'Application Approved!',
      message: 'Congratulations! You can now access your Partner Dashboard and start creating offers.',
      color: 'text-success',
      bg: 'bg-success/10',
      ring: 'ring-success/30',
    },
    rejected: {
      icon: XCircle,
      title: 'Application Rejected',
      message: application.rejection_reason || 'Your application was not approved. Please review and reapply.',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      ring: 'ring-destructive/30',
    },
  } as const;

  const c = config[status] ?? config.pending;
  const Icon = c.icon;

  const timeline = [
    { label: 'Application Submitted', date: application.created_at, done: true },
    { label: 'Admin Review', date: application.reviewed_at, done: status !== 'pending' },
    { label: 'Approved', date: status === 'approved' ? application.reviewed_at : null, done: status === 'approved' },
  ];

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('flex items-start gap-4 rounded-2xl p-6 ring-1', c.bg, c.ring)}
      >
        <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl', c.bg)}>
          <Icon className={cn('h-7 w-7', c.color)} />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold">{c.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{c.message}</p>
          {status === 'approved' && (
            <Link href="/vendor/dashboard" className="mt-3 inline-block">
              <Button className="btn-shine bg-primary-gradient" size="sm">
                Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Application Timeline
        </h4>
        <div className="space-y-4">
          {timeline.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={cn(
                'grid h-8 w-8 shrink-0 place-items-center rounded-full',
                item.done ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
              )}>
                {item.done ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-semibold', item.done ? 'text-foreground' : 'text-muted-foreground')}>
                  {item.label}
                </p>
                {item.date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application summary */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Application Details
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Business" value={application.business_name} />
          <DetailRow label="Type" value={application.business_type} />
          <DetailRow label="Contact" value={application.contact_name} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Phone" value={application.phone} />
          <DetailRow label="City" value={application.city} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/50 pb-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
