'use client';

import { motion } from 'framer-motion';
import { Users, Wallet, BarChart3, QrCode, Globe2, UserCog, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

const FEATURES = [
  { icon: Users, key: 'corporate.feature.employees' as const, desc: 'Reward employees with custom gift cards, experiences, and perks they actually want.' },
  { icon: Wallet, key: 'corporate.feature.budgets' as const, desc: 'Set monthly or annual budgets per department, team, or individual — with real-time tracking.' },
  { icon: BarChart3, key: 'corporate.feature.analytics' as const, desc: 'Track engagement, redemption rates, and ROI with a live analytics dashboard.' },
  { icon: QrCode, key: 'corporate.feature.qr' as const, desc: 'Every reward generates a unique QR code and secure token for instant redemption.' },
  { icon: Globe2, key: 'corporate.feature.multi' as const, desc: 'Operate across multiple African countries with automatic currency conversion.' },
  { icon: UserCog, key: 'corporate.feature.teams' as const, desc: 'Granular roles and permissions for admins, HR, managers, and employees.' },
];

export function CorporateSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-white sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-kente opacity-30" />
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary"
            >
              <Globe2 className="h-4 w-4" /> PerkPass for Business
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              {t('section.corporate.title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-md text-lg text-white/70"
            >
              {t('section.corporate.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/signup"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary-hover"
              >
                {t('corporate.cta')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/business"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-7 font-semibold text-white transition-all hover:bg-white/10"
              >
                {t('common.learnMore')}
              </Link>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:border-primary/30 hover:bg-white/10"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15">
                  <f.icon className="h-6 w-6 text-primary" strokeWidth={2.2} />
                </div>
                <h3 className="mt-3 font-display text-base font-bold">{t(f.key)}</h3>
                <p className="mt-1.5 text-sm text-white/60">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
