'use client';

import { motion } from 'framer-motion';
import { Store, TrendingUp, Users, Shield, Wallet, ArrowRight, Check, Star, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading, StatCard } from '@/components/ui/primitives';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const BENEFITS = [
  { icon: TrendingUp, title: 'Reach 250K+ Members', description: 'Get your offers in front of an active, engaged audience across 54 African countries.' },
  { icon: Wallet, title: 'Zero Upfront Cost', description: 'List your offers for free. You only pay a small commission on successful redemptions.' },
  { icon: BarChart3, title: 'Real-time Analytics', description: 'Track views, redemptions, and conversion rates with a dedicated vendor dashboard.' },
  { icon: Shield, title: 'Verified & Trusted', description: 'Our admin review process ensures only legitimate businesses join the platform.' },
  { icon: Users, title: 'Targeted Audience', description: 'Connect with premium members who are actively looking for lifestyle experiences.' },
  { icon: Store, title: 'Easy Offer Management', description: 'Create, edit, publish, and archive offers with an intuitive editor tool.' },
];

const STEPS = [
  { num: '1', title: 'Submit Application', description: 'Fill out the vendor registration form with your business details and documents.' },
  { num: '2', title: 'Admin Review', description: 'Our team reviews your application within 2-3 business days.' },
  { num: '3', title: 'Get Approved', description: 'Once approved, you get instant access to your Partner Dashboard.' },
  { num: '4', title: 'Create Offers', description: 'Publish your first offer and start reaching thousands of members.' },
];

export default function VendorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />

      {/* Hero */}
      <section className="bg-mesh relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary"
            >
              Partner with PerkPass
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
            >
              Become a <span className="text-gradient">Vendor</span> on PerkPass
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg text-muted-foreground"
            >
              Join Africa's fastest-growing lifestyle membership platform. Create offers, reach engaged members, and grow your business.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link href="/vendor/register">
                <Button className="btn-shine bg-primary-gradient px-8 py-3 text-base shadow-glow">
                  <Store className="mr-2 h-5 w-5" /> Start Application
                </Button>
              </Link>
              <Link href="/vendor/status">
                <Button variant="outline" size="lg">
                  Check Application Status <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Members" value="250K+" icon={Users} index={0} />
            <StatCard label="Partner Vendors" value="3,200+" icon={Store} index={1} />
            <StatCard label="Countries" value="54" icon={Shield} index={2} />
            <StatCard label="Monthly Redemptions" value="84K" icon={TrendingUp} index={3} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Join"
            title="Benefits of Becoming a Vendor"
            subtitle="Everything you need to grow your business on the PerkPass platform."
            center
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="card-lift glass-card h-full p-6">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-gradient shadow-glow">
                    <b.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-lavender py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Process"
            title="How It Works"
            subtitle="From application to your first offer in four simple steps."
            center
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-gradient text-xl font-extrabold text-white shadow-glow">
                  {step.num}
                </div>
                <h3 className="font-display text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features checklist */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="glass-card overflow-hidden p-8 sm:p-10">
            <SectionHeading
              eyebrow="Included"
              title="What You Get as a Vendor"
              center
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Full Partner Dashboard access',
                'Unlimited offer creation',
                'Real-time views & redemption tracking',
                'Offer scheduling & expiry control',
                'QR code redemption system',
                'Performance analytics & export',
                'Business profile page',
                'Priority support channel',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/10">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/vendor/register">
                <Button className="btn-shine bg-primary-gradient px-8 py-3 text-base shadow-glow">
                  <Store className="mr-2 h-5 w-5" /> Start Your Application
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonial strip */}
      <section className="bg-lavender py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-2 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
          </div>
          <p className="font-display text-xl font-medium leading-relaxed sm:text-2xl">
            "PerkPass brought us 3x more customers in the first month. The dashboard makes it incredibly easy to manage our offers."
          </p>
          <p className="mt-4 text-sm font-bold">Fatima Zahra, Owner — Serenity Spa Nairobi</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
