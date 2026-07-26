'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, Gift, QrCode, Wallet, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, Loader2, Building2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents, formatDate } from '@/lib/utils';
import type { Employee, RewardAssignment, RewardCatalogItem } from '@/lib/types';

interface KpiData {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalRewards: number;
  assignedRewards: number;
  redeemedRewards: number;
  budgetUsedCents: number;
  budgetRemainingCents: number;
}

interface ActivityItem {
  id: string;
  action: string;
  actor_id: string | null;
  entity_type: string | null;
  created_at: string;
}

const PIE_COLORS = ['#F96324', '#0D9488', '#F5B301', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; assignments: number; redemptions: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [topEmployees, setTopEmployees] = useState<{ name: string; redeemed: number }[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!company) return;
    loadData();
  }, [company]);

  const loadData = async () => {
    if (!company) return;
    setDataLoading(true);

    const [empRes, rewardRes, assignRes] = await Promise.all([
      supabase.from('employees').select('*').eq('company_id', company.id),
      supabase.from('rewards_catalog').select('*').eq('company_id', company.id),
      supabase.from('reward_assignments').select('*').eq('company_id', company.id),
    ]);

    const employees = (empRes.data as Employee[]) ?? [];
    const rewards = (rewardRes.data as RewardCatalogItem[]) ?? [];
    const assignments = (assignRes.data as RewardAssignment[]) ?? [];

    const active = employees.filter((e) => e.status === 'active').length;
    const assigned = assignments.length;
    const redeemed = assignments.filter((a) => a.status === 'used').length;
    const budgetUsed = assignments.reduce((sum, a) => sum + a.value_cents, 0);
    const annualBudget = company.annual_budget_cents;

    setKpi({
      totalEmployees: employees.length,
      activeEmployees: active,
      inactiveEmployees: employees.length - active,
      totalRewards: rewards.length,
      assignedRewards: assigned,
      redeemedRewards: redeemed,
      budgetUsedCents: budgetUsed,
      budgetRemainingCents: Math.max(0, annualBudget - budgetUsed),
    });

    // Monthly chart data (last 6 months)
    const now = new Date();
    const months: { name: string; assignments: number; redemptions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const monthAssign = assignments.filter((a) => {
        const ad = new Date(a.created_at);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      });
      const monthRedeem = assignments.filter((a) => {
        if (!a.redeemed_at) return false;
        const rd = new Date(a.redeemed_at);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      });
      months.push({ name: monthName, assignments: monthAssign.length, redemptions: monthRedeem.length });
    }
    setMonthlyData(months);

    // Category distribution
    const catMap: Record<string, number> = {};
    rewards.forEach((r) => {
      catMap[r.category] = (catMap[r.category] ?? 0) + 1;
    });
    setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

    // Top employees by redemption
    const empRedeemMap: Record<string, number> = {};
    assignments.forEach((a) => {
      if (a.status === 'used') {
        empRedeemMap[a.employee_id] = (empRedeemMap[a.employee_id] ?? 0) + 1;
      }
    });
    const top = Object.entries(empRedeemMap)
      .map(([empId, redeemed]) => {
        const emp = employees.find((e) => e.id === empId);
        return { name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown', redeemed };
      })
      .sort((a, b) => b.redeemed - a.redeemed)
      .slice(0, 5);
    setTopEmployees(top);

    // Recent activity from audit logs
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('id, action, actor_id, entity_type, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(8);
    setRecentActivity((logs as ActivityItem[]) ?? []);

    setDataLoading(false);
  };

  if (authLoading || companyLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!company) {
    router.push('/onboarding');
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Employees', value: kpi?.totalEmployees ?? 0,
      sub: `${kpi?.activeEmployees ?? 0} active · ${kpi?.inactiveEmployees ?? 0} inactive`,
      icon: Users, color: 'primary', trend: null,
    },
    {
      label: 'Rewards Catalog', value: kpi?.totalRewards ?? 0,
      sub: `${kpi?.assignedRewards ?? 0} assigned`,
      icon: Gift, color: 'secondary', trend: null,
    },
    {
      label: 'Redeemed', value: kpi?.redeemedRewards ?? 0,
      sub: `${kpi?.assignedRewards ? Math.round((kpi.redeemedRewards / kpi.assignedRewards) * 100) : 0}% redemption rate`,
      icon: QrCode, color: 'accent', trend: 'up' as const,
    },
    {
      label: 'Budget Used', value: formatCents(kpi?.budgetUsedCents ?? 0, company.currency_code),
      sub: `${formatCents(kpi?.budgetRemainingCents ?? 0, company.currency_code)} remaining`,
      icon: Wallet, color: 'warning', trend: 'down' as const,
    },
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title="Dashboard"
            subtitle={`Welcome back, ${user.user_metadata?.full_name ?? user.email}`}
          />

          {dataLoading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-border bg-card p-5 shadow-premium"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`grid h-11 w-11 place-items-center rounded-xl ${colorMap[card.color]}`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      {card.trend && (
                        <span className={`flex items-center gap-1 text-xs font-semibold ${card.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                          {card.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 font-display text-2xl font-extrabold text-foreground">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Monthly activity */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium lg:col-span-2">
                  <h3 className="font-display text-lg font-bold text-foreground">Monthly Activity</h3>
                  <p className="text-sm text-muted-foreground">Assignments vs redemptions over the last 6 months</p>
                  <div className="mt-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="gradAssign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F96324" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F96324" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradRedeem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
                        />
                        <Area type="monotone" dataKey="assignments" stroke="#F96324" strokeWidth={2} fill="url(#gradAssign)" name="Assigned" />
                        <Area type="monotone" dataKey="redemptions" stroke="#0D9488" strokeWidth={2} fill="url(#gradRedeem)" name="Redeemed" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category distribution */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Reward Categories</h3>
                  <p className="text-sm text-muted-foreground">Distribution by type</p>
                  <div className="mt-6 h-48">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                            {categoryData.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">No rewards yet</div>
                    )}
                  </div>
                  {categoryData.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      {categoryData.slice(0, 5).map((c, idx) => (
                        <div key={c.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="capitalize text-muted-foreground">{c.name}</span>
                          </span>
                          <span className="font-semibold text-foreground">{c.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom row: top employees + recent activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Top Employees</h3>
                  <p className="text-sm text-muted-foreground">By rewards redeemed</p>
                  <div className="mt-4 h-56">
                    {topEmployees.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topEmployees} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={100} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                          <Bar dataKey="redeemed" fill="#F96324" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">No redemptions yet</div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Latest events in your workspace</p>
                  <div className="mt-4 space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{item.action}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="grid place-items-center py-8 text-sm text-muted-foreground">
                        <Building2 className="mb-2 h-8 w-8 text-muted-foreground/40" />
                        No activity yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
