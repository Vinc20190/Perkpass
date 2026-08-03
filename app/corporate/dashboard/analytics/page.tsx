'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, Loader2, Download, TrendingUp, Users, Gift,
  Wallet, Activity, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents } from '@/lib/utils';
import type { Employee, RewardAssignment, RewardCatalogItem, Department } from '@/lib/types';

const CHART_COLORS = ['#1e3a5f', '#e8b84a', '#c89730', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f43f5e'];

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, departments, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<RewardAssignment[]>([]);
  const [rewards, setRewards] = useState<RewardCatalogItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !companyLoading && user && !company) router.push('/onboarding');
  }, [authLoading, loading, user, company, router]);

  const loadData = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const [empRes, assignRes, rewardRes] = await Promise.all([
      supabase.from('employees').select('*').eq('company_id', company.id),
      supabase.from('reward_assignments').select('*').eq('company_id', company.id),
      supabase.from('rewards_catalog').select('*').eq('company_id', company.id),
    ]);
    setEmployees((empRes.data as Employee[]) ?? []);
    setAssignments((assignRes.data as RewardAssignment[]) ?? []);
    setRewards((rewardRes.data as RewardCatalogItem[]) ?? []);
    setLoading(false);
  }, [company]);

  useEffect(() => { loadData(); }, [loadData]);

  // Computed analytics
  const totalAssignments = assignments.length;
  const totalRedeemed = assignments.filter((a) => a.status === 'used').length;
  const totalBudgetUsed = assignments.reduce((sum, a) => sum + a.value_cents, 0);
  const engagementRate = totalAssignments > 0 ? Math.round((totalRedeemed / totalAssignments) * 100) : 0;
  const avgRewardValue = rewards.length > 0 ? Math.round(rewards.reduce((s, r) => s + r.value_cents, 0) / rewards.length) : 0;

  // Monthly trend (12 months)
  const now = new Date();
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
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
    const monthSpend = monthAssign.reduce((s, a) => s + a.value_cents, 0);
    return { name: monthName, assigned: monthAssign.length, redeemed: monthRedeem.length, spend: monthSpend / 100 };
  });

  // Department breakdown
  const deptBreakdown = departments.map((dept) => {
    const deptEmps = employees.filter((e) => e.department_id === dept.id);
    const deptAssigns = assignments.filter((a) => deptEmps.some((e) => e.id === a.employee_id));
    const deptRedeemed = deptAssigns.filter((a) => a.status === 'used').length;
    return {
      name: dept.name,
      employees: deptEmps.length,
      assignments: deptAssigns.length,
      redeemed: deptRedeemed,
      spend: deptAssigns.reduce((s, a) => s + a.value_cents, 0) / 100,
    };
  }).sort((a, b) => b.assignments - a.assignments);

  // Reward performance
  const rewardPerf = rewards.map((r) => {
    const rAssigns = assignments.filter((a) => a.reward_id === r.id);
    const rRedeemed = rAssigns.filter((a) => a.status === 'used').length;
    return {
      name: r.name.length > 20 ? r.name.slice(0, 18) + '…' : r.name,
      assigned: rAssigns.length,
      redeemed: rRedeemed,
      rate: rAssigns.length > 0 ? Math.round((rRedeemed / rAssigns.length) * 100) : 0,
    };
  }).sort((a, b) => b.assigned - a.assigned).slice(0, 8);

  // Status distribution
  const statusDist = ['available', 'used', 'scheduled', 'expired', 'cancelled'].map((s) => ({
    name: s,
    value: assignments.filter((a) => a.status === s).length,
  })).filter((d) => d.value > 0);

  // Engagement radial
  const engagementData = [{ name: 'engagement', value: engagementRate, fill: '#1e3a5f' }];

  const exportReport = () => {
    const lines = [
      ['PerkPass Analytics Report', company?.name ?? '', new Date().toISOString()],
      [],
      ['Metric', 'Value'],
      ['Total Employees', String(employees.length)],
      ['Active Employees', String(employees.filter((e) => e.status === 'active').length)],
      ['Total Rewards', String(rewards.length)],
      ['Total Assignments', String(totalAssignments)],
      ['Total Redeemed', String(totalRedeemed)],
      ['Engagement Rate', `${engagementRate}%`],
      ['Budget Used', formatCents(totalBudgetUsed, company?.currency_code ?? 'USD')],
      ['Avg Reward Value', formatCents(avgRewardValue, company?.currency_code ?? 'USD')],
      [],
      ['Department', 'Employees', 'Assignments', 'Redeemed', 'Spend'],
      ...deptBreakdown.map((d) => [d.name, String(d.employees), String(d.assignments), String(d.redeemed), String(d.spend)]),
      [],
      ['Reward', 'Assigned', 'Redeemed', 'Rate %'],
      ...rewardPerf.map((r) => [r.name, String(r.assigned), String(r.redeemed), `${r.rate}%`]),
    ];
    const csv = lines.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;
  if (!company) return null;

  const summaryCards = [
    { label: 'Engagement Rate', value: `${engagementRate}%`, icon: Activity, color: 'bg-primary/10 text-primary' },
    { label: 'Total Assignments', value: String(totalAssignments), icon: Gift, color: 'bg-secondary/10 text-secondary' },
    { label: 'Budget Used', value: formatCents(totalBudgetUsed, company.currency_code), icon: Wallet, color: 'bg-accent/10 text-accent' },
    { label: 'Avg Reward Value', value: formatCents(avgRewardValue, company.currency_code), icon: Award, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title="Analytics"
            subtitle="Track engagement, spending, and reward performance"
            actions={
              <button
                onClick={exportReport}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Download className="h-4 w-4" /> Export Report
              </button>
            }
          />

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-border bg-card p-5 shadow-premium"
                  >
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-extrabold text-foreground">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* 12-month trend */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                <h3 className="font-display text-lg font-bold text-foreground">12-Month Trend</h3>
                <p className="text-sm text-muted-foreground">Assignments, redemptions, and spending over time</p>
                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient id="gAssign" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gRedeem" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e8b84a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#e8b84a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Area type="monotone" dataKey="assigned" stroke="#1e3a5f" strokeWidth={2} fill="url(#gAssign)" name="Assigned" />
                      <Area type="monotone" dataKey="redeemed" stroke="#e8b84a" strokeWidth={2} fill="url(#gRedeem)" name="Redeemed" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly spend */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Monthly Spend</h3>
                  <p className="text-sm text-muted-foreground">Total reward value assigned per month</p>
                  <div className="mt-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                        <Bar dataKey="spend" fill="#c89730" radius={[6, 6, 0, 0]} name="Spend (USD)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Engagement gauge */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Engagement Rate</h3>
                  <p className="text-sm text-muted-foreground">Redemption rate across all assignments</p>
                  <div className="mt-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="50%" outerRadius="90%" barSize={24} data={engagementData} startAngle={90} endAngle={90 - (engagementRate / 100) * 360}>
                        <RadialBar background dataKey="value" cornerRadius={12} fill="#1e3a5f" />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-display" style={{ fontSize: 36, fontWeight: 800, fill: '#0F172A' }}>
                          {engagementRate}%
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Department breakdown */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium lg:col-span-2">
                  <h3 className="font-display text-lg font-bold text-foreground">Department Breakdown</h3>
                  <p className="text-sm text-muted-foreground">Assignments and spend by department</p>
                  <div className="mt-6 h-64">
                    {deptBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                          <Legend wrapperStyle={{ fontSize: 13 }} />
                          <Bar dataKey="assignments" fill="#1e3a5f" radius={[6, 6, 0, 0]} name="Assignments" />
                          <Bar dataKey="redeemed" fill="#e8b84a" radius={[6, 6, 0, 0]} name="Redeemed" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">No departments yet</div>
                    )}
                  </div>
                </div>

                {/* Status distribution */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Status Distribution</h3>
                  <p className="text-sm text-muted-foreground">All assignments by status</p>
                  <div className="mt-6 h-48">
                    {statusDist.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                            {statusDist.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="grid h-full place-items-center text-sm text-muted-foreground">No data</div>}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {statusDist.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="capitalize text-muted-foreground">{s.name}</span>
                        </span>
                        <span className="font-semibold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reward performance table */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
                <div className="border-b border-border p-6">
                  <h3 className="font-display text-lg font-bold text-foreground">Reward Performance</h3>
                  <p className="text-sm text-muted-foreground">Top rewards by assignment count and redemption rate</p>
                </div>
                {rewardPerf.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Reward</th>
                          <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Assigned</th>
                          <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Redeemed</th>
                          <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Redemption Rate</th>
                          <th className="px-6 py-3">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rewardPerf.map((r, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="px-6 py-3 font-semibold text-foreground">{r.name}</td>
                            <td className="px-6 py-3 text-right text-muted-foreground">{r.assigned}</td>
                            <td className="px-6 py-3 text-right text-muted-foreground">{r.redeemed}</td>
                            <td className="px-6 py-3 text-right">
                              <span className={`font-bold ${r.rate >= 50 ? 'text-success' : r.rate >= 25 ? 'text-warning' : 'text-destructive'}`}>{r.rate}%</span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${r.rate}%` }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid place-items-center py-12 text-sm text-muted-foreground">No reward data yet</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
