'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles, MapPin, Play } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useCountUp } from '@/hooks/use-count-up';

function Stat({ value, label, suffix, compact }: { value: number; label: string; suffix?: string; compact?: boolean }) {
  const { ref, display } = useCountUp(value);
  const formatted = compact ? display.replace(/,000$/, 'K') : display;
  return (
    <div className="text-center">
      <span ref={ref} className="block font-display text-2xl font-extrabold text-white sm:text-3xl">
        {formatted}{suffix}
      </span>
      <span className="mt-1 block text-xs text-white/60 sm:text-sm">{label}</span>
    </div>
  );
}

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-foreground">
      {/* Background image with overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.pexels.com/photos/3224216/pexels-photo-3224216.jpeg?auto=compress&cs=tinysrgb&w=1920"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 via-foreground/80 to-foreground/60" />
      <div className="pointer-events-none absolute inset-0 bg-kente opacity-10" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-[100vh] max-w-7xl flex-col justify-center px-4 pt-24 pb-12 sm:px-6 lg:px-8 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left: content */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur"
            >
              <Sparkles className="h-4 w-4" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Unlock More.
              <br />
              <span className="text-gradient-animated">{t('hero.title.highlight')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg text-white/70 lg:mx-0"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                href="/signup"
                className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:bg-primary-hover hover:scale-105 sm:w-auto"
              >
                {t('hero.cta')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur transition-all hover:bg-white/20 sm:w-auto"
              >
                <Play className="h-4 w-4 fill-white" />
                {t('hero.cta.secondary')}
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:max-w-lg"
            >
              <Stat value={250} label={t('hero.stat.members')} suffix="K+" />
              <Stat value={3200} label={t('hero.stat.partners')} suffix="+" />
              <Stat value={54} label={t('hero.stat.countries')} />
              <Stat value={18} label={t('hero.stat.saved')} suffix="M" />
            </motion.div>
          </div>

          {/* Right: app mockup + membership card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative z-10 hidden justify-center lg:flex lg:justify-end"
          >
            <div className="relative w-full max-w-sm">
              {/* Phone mockup */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-[2.5rem] border-8 border-white/90 bg-card p-2 shadow-2xl"
              >
                <div className="rounded-[2rem] bg-gradient-to-br from-primary/8 via-card to-secondary/8 p-5">
                  {/* Status bar */}
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>9:41</span>
                    <div className="h-1.5 w-16 rounded-full bg-foreground/20" />
                  </div>

                  {/* Membership card */}
                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-5 text-white shadow-glow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Premium</span>
                      <Sparkles className="h-5 w-5 opacity-90" />
                    </div>
                    <p className="mt-6 font-display text-2xl font-extrabold">Amara O.</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs opacity-80">
                      <MapPin className="h-3 w-3" /> Lagos, Nigeria
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3">
                      <div>
                        <p className="text-[10px] uppercase opacity-70">Member since</p>
                        <p className="text-sm font-semibold">Mar 2026</p>
                      </div>
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 backdrop-blur">
                        <div className="grid grid-cols-3 gap-0.5">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-1 w-1 rounded-sm bg-white" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick offer */}
                  <div className="mt-4 rounded-xl border border-border bg-card p-3 shadow-premium">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/15">
                        <Star className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Sky Restaurant</p>
                        <p className="text-xs text-muted-foreground">Buy One Get One</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">BOGO</span>
                    </div>
                  </div>

                  {/* Savings counter */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-secondary/10 p-3 text-center">
                      <p className="font-display text-xl font-extrabold text-secondary">$1,240</p>
                      <p className="text-[10px] text-muted-foreground">Total saved</p>
                    </div>
                    <div className="rounded-xl bg-accent/10 p-3 text-center">
                      <p className="font-display text-xl font-extrabold text-accent">47</p>
                      <p className="text-[10px] text-muted-foreground">Offers used</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 top-1/2 hidden rounded-2xl border border-border bg-card p-3 shadow-xl lg:block"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-success/15">
                    <Star className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">New offer!</p>
                    <p className="text-[10px] text-muted-foreground">50% off safari</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-4 bottom-16 hidden rounded-2xl border border-border bg-card p-3 shadow-xl lg:block"
              >
                <p className="text-[10px] font-medium uppercase text-muted-foreground">This month</p>
                <p className="font-display text-lg font-extrabold text-primary">$340 saved</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30 pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-1 rounded-full bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
