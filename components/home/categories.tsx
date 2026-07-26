'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { CATEGORIES } from '@/lib/data/home';

export function CategoriesSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Explore
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('section.categories.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t('section.categories.subtitle')}</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[cat.icon] ?? Icons.Sparkles;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                whileHover={{ y: -8 }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-premium transition-shadow hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className={`absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${cat.gradient} opacity-30 blur-2xl transition-all duration-500 group-hover:opacity-60`} />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2">
                    <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${cat.gradient} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{cat.name}</p>
                      <p className="text-xs text-white/70">{cat.count.toLocaleString()} offers</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/50 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
