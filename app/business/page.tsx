'use client';

import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Wallet, Shield, BarChart3, Globe,
  Check, ArrowRight, Building2, QrCode, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionHeading, PageHeader, StatCard } from '@/components/ui/primitives';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: Users, title: 'Employee Rewards', description: 'Assign perks to team members with custom budgets and approval flows.' },
  { icon: Wallet, title: 'Budget Control', description: 'Set monthly or annual budgets per department, team, or individual employee.' },
  { icon: BarChart3, title: 'Real-time Analytics', description: 'Track usage, satisfaction, and ROI with live dashboards and CSV exports.' },
  { icon: QrCode, title: 'QR Redemption', description: 'Employees redeem rewards instantly with unique QR codes at partner venues.' },
  { icon: Globe, title: 'Multi-country Support', description: 'Manage teams across all 54 African countries with local currency support.' },
  { icon: Bell, title: 'Team Management', description: 'Invite members, assign roles, and manage departments from one dashboard.' },
];

const PLANS = [
  { name: 'Starter', price: 'Free', desc: 'Up to 10 employees', features: ['Basic rewards catalog', '1 country', 'Email support'] },
  { name: 'Growth', price: '$99/mo', desc: 'Up to 100 employees', features: ['Custom rewards', '5 countries', 'Analytics dashboard', 'Priority support'], popular: true },
  { name: 'Enterprise', price: 'Custom', desc: 'Unlimited employees', features: ['Unlimited everything', 'All 54 countries', 'Dedicated manager', 'API access'] },
];

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />

      {/* Hero */}
      <section className="bg-mesh relative overflow-hidden py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary"
          >
            For Business
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Reward Your Team with <span className="text-gradient">PerkPass</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            A modern employee benefits platform built for African companies. Manage perks, track usage, and boost satisfaction.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-3"
          >
            <Link href="/signup">
              <Button className="btn-shine bg-primary-gradient px-8 py-3 text-base shadow-glow">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/corporate/dashboard">
              <Button variant="outline" size="lg">
                View HR Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Companies" value="500+" icon={Building2} index={0} />
            <StatCard label="Employees Served" value="120K+" icon={Users} index={1} />
            <StatCard label="Avg Satisfaction" value="94%" icon={TrendingUp} index={2} />
            <StatCard label="Countries" value="54" icon={Shield} index={3} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Platform" title="Everything You Need" subtitle="A complete benefits platform, not just a perks catalog." center />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="card-lift glass-card h-full p-6">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-gradient shadow-glow">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-lavender py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Pricing" title="Business Plans" subtitle="Scale your benefits program as your team grows." center />
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={plan.popular ? 'card-lift border-primary p-6 shadow-glow ring-2 ring-primary/20' : 'glass-card p-6'}>
                  <CardContent className="p-0">
                    <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.desc}</p>
                    <p className="mt-3 font-display text-3xl font-extrabold">{plan.price}</p>
                    <Link href="/signup" className="mt-4 block">
                      <Button className={plan.popular ? 'btn-shine w-full bg-primary-gradient' : 'w-full'} variant={plan.popular ? 'default' : 'outline'}>
                        Get Started
                      </Button>
                    </Link>
                    <div className="mt-5 space-y-2">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-sm">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Ready to Transform Your Team Benefits?</h2>
          <p className="mt-3 text-muted-foreground">Start your free trial today. No credit card required.</p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button className="btn-shine bg-primary-gradient px-8 py-3 text-base shadow-glow">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
