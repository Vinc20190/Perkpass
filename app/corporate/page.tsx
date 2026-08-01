'use client';

import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Wallet, Shield, BarChart3, Globe,
  Check, ArrowRight, Building2, QrCode,
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
  { icon: Shield, title: 'Secure & Compliant', description: 'Enterprise-grade security with role-based access control and audit logs.' },
];

export default function CorporatePage() {
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
            Corporate Solutions
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            PerkPass for <span className="text-gradient">Corporations</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            The complete employee benefits platform for African enterprises. Manage rewards, track engagement, and maximize ROI.
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
                HR Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Corporations" value="500+" icon={Building2} index={0} />
            <StatCard label="Employees" value="120K+" icon={Users} index={1} />
            <StatCard label="Avg ROI" value="3.2x" icon={TrendingUp} index={2} />
            <StatCard label="Satisfaction" value="94%" icon={Shield} index={3} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Platform" title="Built for Enterprise" subtitle="Everything you need to run a modern benefits program." center />
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

      {/* Dashboard preview */}
      <section className="bg-lavender py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Dashboard" title="Powerful HR Dashboard" subtitle="Real-time insights into your benefits program." center />
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: 'Usage Metrics', desc: 'Track which categories are most popular and which employees are most engaged.' },
              { title: 'Budget Tracking', desc: 'Monitor spend across departments in real-time with automated alerts.' },
              { title: 'Satisfaction Scores', desc: 'Post-redemption surveys give you a pulse on employee satisfaction.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card h-full p-6">
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  <Link href="/corporate/dashboard/analytics" className="mt-4 inline-block">
                    <Button variant="ghost" size="sm">
                      Learn More <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Transform Your Corporate Benefits</h2>
          <p className="mt-3 text-muted-foreground">Join 500+ African companies already using PerkPass.</p>
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
