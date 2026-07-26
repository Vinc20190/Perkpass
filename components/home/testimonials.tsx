'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { TESTIMONIALS } from '@/lib/data/home';

export function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('section.testimonials.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t('section.testimonials.subtitle')}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((tm, i) => (
            <motion.div
              key={tm.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-premium"
            >
              <Quote className="h-8 w-8 text-primary/20" />
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: tm.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">"{tm.quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tm.avatar} alt={tm.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-foreground">{tm.name}</p>
                  <p className="text-xs text-muted-foreground">{tm.role} · {tm.flag} {tm.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
