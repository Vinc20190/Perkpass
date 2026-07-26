'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { PARTNER_LOGOS } from '@/lib/data/home';

export function PartnersStrip() {
  const { t } = useI18n();

  return (
    <section className="border-y border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('section.partners.title')}
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-6 sm:grid-cols-4 lg:grid-cols-8">
          {PARTNER_LOGOS.map((p, i) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[p.icon] ?? Icons.Sparkles;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center justify-center gap-2 text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                <Icon className="h-6 w-6" />
                <span className="font-display text-sm font-bold">{p.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
