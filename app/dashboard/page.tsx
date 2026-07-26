'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, Star, Loader2, QrCode, Sparkles, TrendingUp,
  ChevronRight, Heart, Bell, Settings, LogOut, Grid3X3,
  Wallet, Gift, Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/logo';
import { FEATURED_OFFERS, CATEGORIES } from '@/lib/data/home';
import { formatCents } from '@/lib/utils';

const TIER_COLORS: Record<string, string> = {
  premium: 'from-primary to-primary-hover',
  family: 'from-teal-600 to-teal-800',
  starter: 'from-slate-500 to-slate-700',
  enterprise: 'from-amber-600 to-amber-800',
};

const QUICK_LINKS = [
  { label: 'My Offers', icon: Gift, href: '#offers' },
  { label: 'Wallet', icon: Wallet, href: '#wallet' },
  { label: 'History', icon: Clock, href: '#history' },
  { label: 'Categories', icon: Grid3X3, href: '#categories' },
];

export default function MemberDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const fullName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Member';
  const firstName = fullName.split(' ')[0];
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const tier = (user.user_metadata?.plan ?? 'premium') as string;
  const city = user.user_metadata?.city ?? 'Lagos';
  const country = user.user_metadata?.country ?? 'Nigeria';

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary"
            >
              {initials}
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                  <Link href="/dashboard/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button onClick={() => { signOut(); router.push('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">Here are your latest offers and savings.</p>
        </div>

        {/* Membership card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br ${TIER_COLORS[tier] ?? TIER_COLORS.premium} p-6 text-white shadow-glow`}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 right-12 h-32 w-32 rounded-full bg-white/5" />

          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              {tier}
            </span>
            <QrCode className="h-6 w-6 text-white/70" />
          </div>

          <div className="mt-5">
            <p className="font-display text-2xl font-extrabold">{fullName}</p>
            <div className="mt-1 flex items-center gap-1 text-sm text-white/70">
              <MapPin className="h-3.5 w-3.5" />
              {city}, {country}
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">Member since</p>
              <p className="text-sm font-semibold">{memberSince}</p>
            </div>
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Total saved', value: '$1,240', accent: 'text-success' },
            { label: 'Offers used', value: '47', accent: 'text-primary' },
            { label: 'This month', value: '$340', accent: 'text-secondary' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-premium">
              <p className={`font-display text-lg font-extrabold ${s.accent}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-6 grid grid-cols-4 gap-3"
        >
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                <q.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">{q.label}</p>
            </Link>
          ))}
        </motion.div>

        {/* Featured offers */}
        <motion.div
          id="offers"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mb-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Available Offers</h2>
            <Link href="/categories" className="flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {FEATURED_OFFERS.slice(0, 4).map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.05 }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/20 hover:bg-muted/30"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offer.image} alt={offer.partner} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="truncate text-sm font-bold text-foreground">{offer.partner}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{offer.title}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-secondary/15 px-2 py-1 text-xs font-bold text-secondary">
                      {offer.discount}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      {offer.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {offer.city}
                    </span>
                    <span>{offer.category}</span>
                  </div>
                </div>
                <button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Heart className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          id="categories"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Browse Categories</h2>
            <Link href="/categories" className="flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80">
              All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {CATEGORIES.slice(0, 8).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.26 + i * 0.03 }}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-2">
                  <p className="text-xs font-bold text-white">{cat.name}</p>
                  <p className="text-[10px] text-white/70">{cat.count}+ offers</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Corporate portal link for company admins */}
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Corporate Portal</p>
              <p className="text-xs text-muted-foreground">Manage employee rewards & analytics</p>
            </div>
            <Link
              href="/corporate/dashboard"
              className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Open <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
