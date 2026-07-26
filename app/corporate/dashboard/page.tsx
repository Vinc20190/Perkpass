'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, Gift, QrCode, TrendingUp, Wallet, Loader2,
  Building2, Sparkles, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents } from '@/lib/utils';

export default function CorporateDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [stats, setStats] = useState({ employees: 0, rewards: 0, assignments: 0, redeemed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!company) return;
    const loadStats = async () => {
      setLoading(true);
      const [empRes, rewRes, assignRes, redeemRes] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('rewards_catalog').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('reward_assignments').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('reward_assignments').select('id', { count: 'exact', head: true }).eq('company_id', company.id).eq('status', 'used'),
      ]);
      setStats({
        employees: empRes.count ?? 0,
        rewards: rewRes.count ?? 0,
        assignments: assignRes.count ?? 0,
        redeemed: redeemRes.count ?? 0,
      });
      setLoading(false);
    };
    loadStats();
  }, [company]);

  if (authLoading || companyLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;
  if (!company) { router.push('/onboarding'); return null; }

  const kpis = [
    { label: 'Total Employees', value: stats.employees.toString(), icon: Users, accent: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Reward Catalog', value: stats.rewards.toString(), icon: Gift, accent: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Total Assignments', value: stats.assignments.toString(), icon: QrCode, accent: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Redeemed', value: stats.redeemed.toString(), icon: TrendingUp, accent: 'text-success', bg: 'bg-success/10' },
  ];

  const quickActions = [
    { label: 'Add Employee', href: '/corporate/dashboard/employees', icon: Users, desc: 'Manage your team' },
    { label: 'Create Reward', href: '/corporate/dashboard/rewards', icon: Gift, desc: 'Add to catalog' },
    { label: 'Assign Reward', href: '/corporate/dashboard/assignments', icon: QrCode, desc: 'Send to employee' },
    { label: 'View Analytics', href: '/corporate/dashboard/analytics', icon: TrendingUp, desc: 'Track performance' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title={company.name}
            subtitle="Corporate rewards overview"
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Sparkles className="h-3 w-3" /> {company.plan}
              </span>
            }
          />

          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-premium"
              >
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.accent}`} />
                </div>
                <p className="mt-3 font-display text-2xl font-extrabold text-foreground">
                  {loading ? '…' : kpi.value}
                </p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Quick Actions</h2>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((qa, i) => (
              <motion.div
                key={qa.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 + i * 0.05 }}
              >
                <Link
                  href={qa.href}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
                    <qa.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{qa.label}</p>
                    <p className="text-xs text-muted-foreground">{qa.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10">
                  <Wallet className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Budget</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {formatCents(company.monthly_budget_cents, company.currency_code)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan Status</p>
                  <p className="font-display text-xl font-bold capitalize text-foreground">{company.plan_status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
