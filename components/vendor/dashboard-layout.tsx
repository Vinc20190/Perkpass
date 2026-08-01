'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Tag, BarChart3, Settings, Store,
  Plus, ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorApplication } from '@/lib/types';

const NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/vendor/dashboard/offers', label: 'My Offers', icon: Tag },
  { href: '/vendor/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/vendor/dashboard/settings', label: 'Settings', icon: Settings },
];

interface VendorDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function VendorDashboardLayout({
  children, title, subtitle, breadcrumbs, actions,
}: VendorDashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [vendorApp, setVendorApp] = useState<VendorApplication | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/vendor/dashboard');
      return;
    }
    if (!user) return;

    (async () => {
      const { data } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (!data) {
        router.push('/vendor/status');
        return;
      }
      setVendorApp(data as VendorApplication);
      setChecking(false);
    })();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-16" />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="glass-card animate-pulse rounded-2xl p-8">
            <div className="h-8 w-64 rounded-lg bg-muted" />
            <div className="mt-8 h-64 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-card rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-gradient shadow-glow">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{vendorApp?.business_name}</p>
                  <p className="text-xs text-muted-foreground">Vendor Partner</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-primary-gradient text-white shadow-glow'
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function VendorCreateOfferButton() {
  return (
    <Link href="/vendor/dashboard/offers/new">
      <Button className="btn-shine bg-primary-gradient">
        <Plus className="mr-2 h-4 w-4" /> Create Offer
      </Button>
    </Link>
  );
}
