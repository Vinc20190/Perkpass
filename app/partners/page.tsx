'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PartnersStrip } from '@/components/home/partners-strip';
import { motion } from 'framer-motion';
import { Handshake, TrendingUp, Users, Star } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';

const BENEFITS = [
  { icon: TrendingUp, title: 'Increase Revenue', desc: 'Reach 250,000+ active members across Africa who are ready to spend on premium experiences.' },
  { icon: Users, title: 'Targeted Audience', desc: 'Connect with engaged members who actively seek out premium offers and experiences.' },
  { icon: Star, title: 'Brand Visibility', desc: "Showcase your business alongside Africa's leading lifestyle brands." },
  { icon: Handshake, title: 'Easy Partnership', desc: 'Simple onboarding, dedicated support, and real-time analytics on offer performance.' },
];

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main>
        <section className="spotlight-grid relative overflow-hidden bg-background bg-grid pt-28 pb-20 sm:pt-32">
          <Spotlight />
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
            >Become a PerkPass Partner</motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
            >Join 3,200+ premium brands across Africa. Grow your business with a partner that cares about your success.</motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <a href="/contact" className="btn-shine inline-flex h-12 items-center gap-2 rounded-xl bg-secondary px-7 font-semibold text-secondary-foreground shadow-glow-gold transition-all hover:scale-105">Get Started</a>
            </motion.div>
          </div>
        </section>

        <PartnersStrip />

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-premium"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/10">
                    <b.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
