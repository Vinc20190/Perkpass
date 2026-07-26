'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { CITIES } from '@/lib/data/home';

export function CitiesSection() {
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
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('section.cities.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t('section.cities.subtitle')}</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CITIES.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border shadow-premium"
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={city.image}
                  alt={city.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-xs font-medium opacity-80">{city.flag} {city.country}</p>
                <p className="font-display text-lg font-extrabold">{city.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs opacity-90">
                  {city.offers} offers
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
