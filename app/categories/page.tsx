'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionHeading, PageHeader } from '@/components/ui/primitives';
import { PerkCard, type PerkOffer } from '@/components/ui/perk-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORIES, FEATURED_OFFERS } from '@/lib/data/home';

const CATEGORY_ICONS: Record<string, string> = {
  UtensilsCrossed: '🍽️', Hotel: '🏨', Plane: '✈️', Flower2: '🌸', Sparkles: '✨',
  Dumbbell: '💪', HeartPulse: '❤️', ShoppingBag: '🛍️', Clapperboard: '🎬',
  Baby: '👶', GraduationCap: '🎓', Car: '🚗', Landmark: '🏦', Briefcase: '💼',
};

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filteredCategories = useMemo(() =>
    CATEGORIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const filteredOffers = useMemo(() => {
    const offers = FEATURED_OFFERS.map((o) => ({
      id: o.id,
      title: o.title,
      partner: o.partner,
      city: o.city,
      flag: o.flag,
      category: o.category,
      discount: o.discount,
      type: o.type,
      rating: o.rating,
      reviews: o.reviews,
      image: o.image,
      expiry: o.expiry,
      distance: o.distance,
    } as PerkOffer));
    if (activeCat) return offers.filter((o) => o.category === activeCat);
    return offers;
  }, [activeCat]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Categories' }]} />
        <PageHeader
          title="Browse Categories"
          subtitle="Explore thousands of premium offers across every lifestyle category."
        />

        {/* Search */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActiveCat(activeCat === cat.name ? null : cat.name)}
              className={cn(
                'card-lift group relative overflow-hidden rounded-2xl border p-5 text-left transition-all',
                activeCat === cat.name
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className={cn('mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-2xl', cat.gradient)}>
                {CATEGORY_ICONS[cat.icon] ?? '⭐'}
              </div>
              <h3 className="font-display text-sm font-bold">{cat.name}</h3>
              <p className="text-xs text-muted-foreground">{cat.count} offers</p>
              {activeCat === cat.name && (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Offers */}
        <div className="mt-12">
          <SectionHeading
            title={activeCat ? `${activeCat} Offers` : 'Featured Offers'}
            subtitle={activeCat ? `Showing offers in ${activeCat}` : 'Hand-picked experiences our members love.'}
          />
          {filteredOffers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No offers found in this category yet. Check back soon!
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer, i) => (
                <PerkCard key={offer.id} offer={offer} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/pricing">
            <Button className="btn-shine bg-primary-gradient" size="lg">
              View All Offers <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
