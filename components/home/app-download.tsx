'use client';

import { motion } from 'framer-motion';
import { Apple, Smartphone, Bell, QrCode, Star } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function AppDownloadSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-hover px-6 py-16 text-center text-white shadow-glow sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-kente opacity-10" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-secondary/20 blur-2xl" />

          <div className="relative mx-auto max-w-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur"
            >
              <Smartphone className="h-8 w-8" />
            </motion.div>

            <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">{t('section.app.title')}</h2>
            <p className="mt-3 text-lg text-white/80">{t('section.app.subtitle')}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 text-white transition-transform hover:scale-105 sm:w-auto">
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-[10px] opacity-80">Download on the</p>
                  <p className="text-base font-semibold leading-tight">App Store</p>
                </div>
              </button>
              <button className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 text-white transition-transform hover:scale-105 sm:w-auto">
                <Smartphone className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-[10px] opacity-80">Get it on</p>
                  <p className="text-base font-semibold leading-tight">Google Play</p>
                </div>
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <span className="flex items-center gap-1.5"><Bell className="h-4 w-4" /> Push notifications</span>
              <span className="flex items-center gap-1.5"><QrCode className="h-4 w-4" /> QR redemption</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> 4.9 rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
