'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionHeading, PageHeader, StatCard } from '@/components/ui/primitives';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CITIES } from '@/lib/data/home';

export default function CitiesPage() {
  const [search, setSearch] = useState('');

  const filteredCities = useMemo(() =>
    CITIES.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const totalOffers = CITIES.reduce((s, c) => s + c.offers, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Cities' }]} />
        <PageHeader
          title="Popular Cities"
          subtitle="Discover the best of Africa's urban centres with exclusive PerkPass offers."
        />

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Cities" value={CITIES.length} icon={MapPin} index={0} />
          <StatCard label="Total Offers" value={totalOffers.toLocaleString()} icon={MapPin} index={1} />
          <StatCard label="Countries" value={new Set(CITIES.map((c) => c.country)).size} icon={MapPin} index={2} />
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by city or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* City grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="card-lift group overflow-hidden p-0">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-xl font-extrabold text-white">{city.name}</h3>
                      <p className="text-sm text-white/80">{city.country} {city.flag}</p>
                    </div>
                    <span className="rounded-xl bg-primary-gradient px-3 py-1 text-sm font-bold text-white shadow-glow">
                      {city.offers} offers
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="w-full">
                      Browse Offers <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No cities found matching your search.
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/countries">
            <Button className="btn-shine bg-primary-gradient" size="lg">
              Explore All Countries <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
