'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionHeading, PageHeader, StatCard } from '@/components/ui/primitives';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/lib/data/home';

type Billing = 'monthly' | 'yearly';

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Pricing' }]} />
        <PageHeader
          title="Simple, Transparent Pricing"
          subtitle="Choose the plan that fits your life. Cancel anytime."
        />

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <StatCard label="Active Members" value="250K+" icon={Users} index={0} />
          <StatCard label="Premium Partners" value="3,200+" icon={Star} index={1} />
          <StatCard label="Countries Covered" value="54" icon={Sparkles} index={2} />
        </div>

        {/* Billing toggle */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              'rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
              billing === 'monthly' ? 'bg-primary-gradient text-white shadow-glow' : 'text-muted-foreground hover:bg-primary/10'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
              billing === 'yearly' ? 'bg-primary-gradient text-white shadow-glow' : 'text-muted-foreground hover:bg-primary/10'
            )}
          >
            Yearly
            <Badge className="bg-success/10 text-success">Save 20%</Badge>
          </button>
        </div>

        {/* Plans */}
        <div className="grid gap-6 lg:grid-cols-4">
          {PRICING_PLANS.map((plan, i) => {
            const price = billing === 'monthly' ? plan.monthlyUsd : plan.yearlyUsd;
            const display = plan.id === 'enterprise' ? 'Custom' : price === 0 ? 'Free' : `$${price}`;
            const period = plan.id === 'enterprise' ? '' : billing === 'monthly' ? '/mo' : '/yr';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn(
                  'card-lift relative h-full p-6',
                  plan.popular ? 'border-primary shadow-glow ring-2 ring-primary/20' : 'glass-card'
                )}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary-gradient px-4 py-1 text-xs font-bold text-white shadow-glow">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-0">
                    <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-extrabold">{display}</span>
                      {period && <span className="text-sm text-muted-foreground">{period}</span>}
                    </div>
                    <Link href={plan.id === 'enterprise' ? '/corporate' : '/signup'} className="mt-5 block">
                      <Button
                        className={cn('w-full', plan.popular ? 'btn-shine bg-primary-gradient' : '')}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.id === 'free' && 'Get Started'}
                        {plan.id === 'premium' && 'Start Free Trial'}
                        {plan.id === 'family' && 'Choose Family'}
                        {plan.id === 'enterprise' && 'Contact Sales'}
                      </Button>
                    </Link>
                    <div className="mt-6 space-y-3">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2">
                          <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/10">
                            <Check className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ teaser */}
        <div className="mt-16">
          <Card className="glass-card p-8 text-center">
            <SectionHeading title="Still Have Questions?" subtitle="We've got answers." center />
            <Link href="/contact">
              <Button className="btn-shine bg-primary-gradient" size="lg">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
