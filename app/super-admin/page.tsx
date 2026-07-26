'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, Loader2, Building2, DollarSign, Users, Gift,
  TrendingUp, Search, MoreVertical, Edit2, Ban, CheckCircle2,
  X, AlertCircle, ArrowLeft,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents, formatDate } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

interface CompanyStat {
  id: string;
  name: string;
  slug: string;
  plan: string;
  plan_status: string;
  is_active: boolean;
  trial_ends_at: string | null;
  created_at: string;
  member_count: number;
  employee_count: number;
  active_employees: number;
  assignment_count: number;
  redeemed_count: number;
  revenue_cents: number;
}

interface GlobalStats {
  total_companies: number;
  active_companies: number;
  trial_companies: number;
  total_revenue_cents: number;
  total_employees: number;
  total_assignments: number;
  total_users: number;
}

interface ApiResponse {
  companies: CompanyStat[];
  stats: GlobalStats;
  monthly_new: { name: string; new_companies: number }[];
}

const PIE_COLORS = ['#F96324', '#0D9488', '#F5B301', '#3B82F6', '#8B5CF6'];
const PLAN_COLORS: Record<string, string> = {
  starter: '#94A3B8', business: '#F96324', enterprise: '#0D9488',
};

export default function SuperAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('No session');

      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/super-admin-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        },
      });
      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading || companyLoading) return;
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [authLoading, companyLoading, isSuperAdmin, loadData, router]);

  const toggleCompany = async (comp: CompanyStat) => {
    setActionMsg(null);
    const { error } = await supabase
      .from('companies')
      .update({ is_active: !comp.is_active })
      .eq('id', comp.id);
    if (error) {
      setActionMsg(error.message);
    } else {
      setActionMsg(`${comp.name} ${comp.is_active ? 'suspended' : 'reactivated'}`);
      loadData();
    }
    setMenuOpen(null);
  };

  const changePlan = async (comp: CompanyStat, plan: string) => {
    const { error } = await supabase.from('companies').update({ plan, plan_status: 'active' }).eq('id', comp.id);
    if (error) setActionMsg(error.message); else { setActionMsg(`${comp.name} plan changed to ${plan}`); loadData(); }
    setMenuOpen(null);
  };

  if (authLoading || companyLoading) {
    return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;
  if (!isSuperAdmin) return null;

  const stats = data?.stats;
  const companies = data?.companies ?? [];
  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const cards = [
    { label: 'Total Companies', value: stats?.total_companies ?? 0, icon: Building2, color: 'bg-primary/10 text-primary' },
    { label: 'Total Revenue', value: formatCents(stats?.total_revenue_cents ?? 0, 'USD'), icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
    { label: 'Total Employees', value: stats?.total_employees ?? 0, icon: Users, color: 'bg-accent/10 text-accent' },
    { label: 'Total Assignments', value: stats?.total_assignments ?? 0, icon: Gift, color: 'bg-warning/10 text-warning' },
  ];

  const planDist = ['starter', 'business', 'enterprise'].map((p) => ({
    name: p,
    value: companies.filter((c) => c.plan === p).length,
  })).filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title="Super Admin"
            subtitle="Global platform oversight — all companies and revenue"
          />

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {actionMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {actionMsg}
              <button onClick={() => setActionMsg(null)} className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, i) => (
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

              <div className="grid gap-6 lg:grid-cols-3">
                {/* New companies chart */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium lg:col-span-2">
                  <h3 className="font-display text-lg font-bold text-foreground">New Companies (6 months)</h3>
                  <p className="text-sm text-muted-foreground">Growth trend across the platform</p>
                  <div className="mt-6 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.monthly_new ?? []}>
                        <defs>
                          <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F96324" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F96324" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                        <Area type="monotone" dataKey="new_companies" stroke="#F96324" strokeWidth={2} fill="url(#gNew)" name="New companies" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Plan distribution */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  <h3 className="font-display text-lg font-bold text-foreground">Plan Distribution</h3>
                  <p className="text-sm text-muted-foreground">Companies by subscription plan</p>
                  <div className="mt-6 h-48">
                    {planDist.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                            {planDist.map((d, idx) => <Cell key={idx} fill={PLAN_COLORS[d.name] ?? PIE_COLORS[idx]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="grid h-full place-items-center text-sm text-muted-foreground">No data</div>}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {planDist.map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAN_COLORS[p.name] }} />
                          <span className="capitalize text-muted-foreground">{p.name}</span>
                        </span>
                        <span className="font-semibold text-foreground">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Companies table */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
                <div className="border-b border-border p-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Company</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Plan</th>
                        <th className="hidden px-4 py-3 text-right font-semibold text-muted-foreground sm:table-cell">Employees</th>
                        <th className="hidden px-4 py-3 text-right font-semibold text-muted-foreground sm:table-cell">Assignments</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Revenue</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((comp) => (
                        <tr key={comp.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{comp.name}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(comp.created_at)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={{
                              background: `${PLAN_COLORS[comp.plan]}20`,
                              color: PLAN_COLORS[comp.plan],
                            }}>{comp.plan}</span>
                          </td>
                          <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">{comp.employee_count}</td>
                          <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">{comp.assignment_count}</td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCents(comp.revenue_cents, 'USD')}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              comp.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${comp.is_active ? 'bg-success' : 'bg-destructive'}`} />
                              {comp.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="relative inline-block">
                              <button
                                onClick={() => setMenuOpen(menuOpen === comp.id ? null : comp.id)}
                                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {menuOpen === comp.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl"
                                  >
                                    <p className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">Change plan</p>
                                    {['starter', 'business', 'enterprise'].map((p) => (
                                      <button key={p} onClick={() => changePlan(comp, p)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize text-foreground hover:bg-muted">
                                        <Edit2 className="h-3.5 w-3.5" /> {p}
                                      </button>
                                    ))}
                                    <div className="my-1 h-px bg-border" />
                                    <button onClick={() => toggleCompany(comp)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      {comp.is_active ? <><Ban className="h-4 w-4" /> Suspend</> : <><CheckCircle2 className="h-4 w-4" /> Reactivate</>}
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
