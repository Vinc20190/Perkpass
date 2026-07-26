'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { PRICING_PLANS } from '@/lib/data/home';

export function PricingSection() {
  const { t, formatPrice } = useI18n();
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t('pricing.subtitle')}</p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5 shadow-premium">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${!yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              {t('pricing.yearly')}
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">{t('pricing.save')}</span>
            </button>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {PRICING_PLANS.map((plan, i) => {
            const price = yearly ? plan.yearlyUsd : plan.monthlyUsd;
            const isFree = plan.monthlyUsd === 0 && plan.id !== 'enterprise';
            const isEnterprise = plan.id === 'enterprise';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-premium transition-shadow hover:shadow-xl ${
                  plan.popular ? 'border-primary shadow-glow' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
                    {t('pricing.popular')}
                  </span>
                )}

                <h3 className="font-display text-xl font-extrabold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                <div className="mt-5">
                  {isEnterprise ? (
                    <p className="font-display text-3xl font-extrabold text-foreground">Custom</p>
                  ) : isFree ? (
                    <p className="font-display text-3xl font-extrabold text-foreground">{t('pricing.free')}</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-extrabold text-foreground">
                        {formatPrice(price)}
                      </span>
                      <span className="text-sm text-muted-foreground">{t('pricing.perMonth')}</span>
                    </div>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.popular ? 'bg-primary/15' : 'bg-secondary/15'}`}>
                        <Check className={`h-3 w-3 ${plan.popular ? 'text-primary' : 'text-secondary'}`} />
                      </span>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.id === 'enterprise' ? '/business' : '/signup'}
                  className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover'
                      : 'border border-border text-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {t(plan.ctaKey)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
