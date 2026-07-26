'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { COUNTRY_HIGHLIGHTS } from '@/lib/data/home';

export function CountriesSection() {
  const { t, formatPrice } = useI18n();

  return (
    <section className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t('nav.countries')}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">Premium benefits across the entire continent.</p>
          </div>
          <button className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-hover">
            {t('common.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {COUNTRY_HIGHLIGHTS.map((c, i) => (
            <motion.div
              key={c.iso}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-premium transition-shadow hover:shadow-lg"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-9 place-items-center rounded bg-primary/10 text-xs font-bold text-primary">{c.flag}</span>
                  <p className="font-display text-base font-bold text-foreground">{c.name}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.region} · {c.offers} offers</p>
                <p className="mt-1 text-xs font-semibold text-secondary">from {formatPrice(c.priceUsd)}/mo</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
