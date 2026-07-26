'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { motion } from 'framer-motion';
import { Heart, Target, Globe2, Users, Award, Zap } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';

const VALUES = [
  { icon: Heart, title: 'Member First', desc: 'Every decision starts with what creates the most value for our members.' },
  { icon: Globe2, title: 'Pan-African', desc: 'We build for all 54 countries, representing the full diversity of the continent.' },
  { icon: Zap, title: 'Premium by Default', desc: 'We hold ourselves to the highest standard of design and experience.' },
  { icon: Users, title: 'Community Driven', desc: 'Our partners and members shape the platform together.' },
  { icon: Award, title: 'Excellence', desc: 'We pursue perfection in every pixel, every offer, every interaction.' },
  { icon: Target, title: 'Impact', desc: 'We measure success by the economic impact we create across Africa.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="spotlight-grid relative overflow-hidden bg-background bg-grid bg-grid-fade pt-28 pb-20 sm:pt-32">
          <Spotlight />
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
            >About PerkPass</motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
            >Building Africa's lifestyle economy.</motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            >PerkPass is on a mission to make premium lifestyle accessible to every African. We connect members with exclusive offers from thousands of partners across the continent, while giving businesses a modern platform to reward their teams.</motion.p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-6 shadow-premium"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
                    <v.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">Our numbers</h2>
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: '250K+', label: 'Active members' },
                { value: '3,200+', label: 'Premium partners' },
                { value: '54', label: 'Countries' },
                { value: '$18M+', label: 'Saved by members' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
