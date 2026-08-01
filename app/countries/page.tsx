'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionHeading, PageHeader, StatCard } from '@/components/ui/primitives';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { COUNTRY_HIGHLIGHTS } from '@/lib/data/home';

const REGIONS = ['All', 'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa'];

export default function CountriesPage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');

  const filtered = useMemo(() => {
    return COUNTRY_HIGHLIGHTS.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = region === 'All' || c.region === region;
      return matchesSearch && matchesRegion;
    });
  }, [search, region]);

  const totalOffers = COUNTRY_HIGHLIGHTS.reduce((s, c) => s + c.offers, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Countries' }]} />
        <PageHeader
          title="Countries We Cover"
          subtitle="PerkPass is available across all 54 African countries. Here are our top markets."
        />

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Countries" value="54" icon={Globe} index={0} />
          <StatCard label="Total Offers" value={totalOffers.toLocaleString()} icon={Globe} index={1} />
          <StatCard label="Regions" value="5" icon={Globe} index={2} />
        </div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={cn(
                  'rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  region === r ? 'bg-primary-gradient text-white shadow-glow' : 'bg-muted text-muted-foreground hover:bg-primary/10'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((country, i) => (
            <motion.div
              key={country.iso}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-lift group p-5">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold">{country.flag}</span>
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {country.offers} offers
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold">{country.name}</h3>
                <p className="text-xs text-muted-foreground">{country.region}</p>
                <Link href="/cities" className="mt-3 block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Browse Cities <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No countries found matching your search.
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/pricing">
            <Button className="btn-shine bg-primary-gradient" size="lg">
              View Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
