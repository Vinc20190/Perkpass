'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, LogIn, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { VendorStatusCard } from '@/components/ui/vendor-status-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorApplication } from '@/lib/types';

export default function VendorStatusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/vendor/status');
      return;
    }
    if (!user) return;

    (async () => {
      setFetching(true);
      const { data, error: err } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setApplications((data ?? []) as VendorApplication[]);
      }
      setFetching(false);
    })();
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-16" />
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="glass-card animate-pulse rounded-2xl p-8">
            <div className="h-8 w-64 rounded-lg bg-muted" />
            <div className="mt-4 h-4 w-96 rounded bg-muted" />
            <div className="mt-8 h-32 rounded-2xl bg-muted" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Vendor', href: '/vendor' },
          { label: 'Application Status' },
        ]} />
        <div className="mt-6 mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Vendor Application Status</h1>
          <p className="mt-2 text-muted-foreground">Track the progress of your vendor application.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No applications yet"
            description="You haven't submitted a vendor application yet. Start your journey as a PerkPass partner."
            action={{ label: 'Become a Vendor', href: '/vendor/register' }}
          />
        ) : (
          <div className="space-y-8">
            {applications.map((app) => (
              <VendorStatusCard key={app.id} application={app} />
            ))}
            {applications.some((a) => a.status === 'approved') && (
              <div className="text-center">
                <Link href="/vendor/dashboard">
                  <Button className="btn-shine bg-primary-gradient px-8 py-3 text-base shadow-glow">
                    Go to Partner Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
