'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Loader2, Building2, DollarSign, Users, Gift,
  Search, MoreVertical, Edit2, Ban, CheckCircle2, XCircle,
  X, AlertCircle, Store, Megaphone, Image as ImageIcon, TrendingUp,
  Eye, MousePointerClick, Zap, RefreshCw, UserPlus, Trash2, ShieldCheck,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents, formatDate, cn } from '@/lib/utils';
import type { VendorApplication, Campaign, BannerPlacement } from '@/lib/types';

type Tab = 'overview' | 'vendors' | 'campaigns' | 'banners' | 'admins';

interface SuperAdminRow {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface CompanyStat {
  id: string; name: string; slug: string; plan: string;
  plan_status: string; is_active: boolean; trial_ends_at: string | null;
  created_at: string; member_count: number; employee_count: number;
  active_employees: number; assignment_count: number; redeemed_count: number;
  revenue_cents: number;
}
interface GlobalStats {
  total_companies: number; active_companies: number; trial_companies: number;
  total_revenue_cents: number; total_employees: number; total_assignments: number;
  total_users: number;
}
interface ApiResponse {
  companies: CompanyStat[]; stats: GlobalStats;
  monthly_new: { name: string; new_companies: number }[];
}

const PIE_COLORS = ['#F96324', '#0D9488', '#F5B301', '#3B82F6', '#8B5CF6'];
const PLAN_COLORS: Record<string, string> = { starter: '#94A3B8', business: '#F96324', enterprise: '#0D9488' };

const TABS: { id: Tab; label: string; icon: typeof Shield }[] = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'vendors', label: 'Vendor Review', icon: Store },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'banners', label: 'Banner Placements', icon: ImageIcon },
  { id: 'admins', label: 'Admins', icon: ShieldCheck },
];

export default function SuperAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Vendor applications
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [vendorFilter, setVendorFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<'pending' | 'active' | 'rejected' | 'paused' | 'completed' | 'refunded' | 'all'>('pending');

  // Banners
  const [banners, setBanners] = useState<BannerPlacement[]>([]);

  // Admins
  const [admins, setAdmins] = useState<SuperAdminRow[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('No session');
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/super-admin-stats`, {
        headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? `HTTP ${res.status}`); }
      setData(await res.json() as ApiResponse);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load data'); }
    setLoading(false);
  }, [user]);

  const loadVendors = useCallback(async () => {
    const { data } = await supabase.from('vendor_applications').select('*').order('created_at', { ascending: false });
    setVendors((data ?? []) as VendorApplication[]);
  }, []);

  const loadCampaigns = useCallback(async () => {
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns((data ?? []) as Campaign[]);
  }, []);

  const loadBanners = useCallback(async () => {
    const { data } = await supabase.from('banner_placements').select('*').order('display_name');
    setBanners((data ?? []) as BannerPlacement[]);
  }, []);

  const loadAdmins = useCallback(async () => {
    const { data } = await supabase.from('super_admins').select('*').order('created_at');
    setAdmins((data ?? []) as SuperAdminRow[]);
  }, []);

  useEffect(() => {
    if (authLoading || companyLoading) return;
    if (!isSuperAdmin) { router.push('/dashboard'); return; }
    loadData(); loadVendors(); loadCampaigns(); loadBanners(); loadAdmins();
  }, [authLoading, companyLoading, isSuperAdmin, loadData, loadVendors, loadCampaigns, loadBanners, loadAdmins, router]);

  // Vendor actions
  const reviewVendor = async (app: VendorApplication, status: 'approved' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Rejection reason (optional):') ?? '' : null;
    const { error } = await supabase.from('vendor_applications').update({
      status, reviewed_by: user?.id, reviewed_at: new Date().toISOString(), rejection_reason: reason,
    }).eq('id', app.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`${app.business_name} ${status}`); loadVendors(); }
    setMenuOpen(null);
  };

  // Campaign actions
  const reviewCampaign = async (c: Campaign, status: 'active' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Rejection reason (optional):') ?? '' : null;
    const { error } = await supabase.from('campaigns').update({
      status, rejection_reason: reason, reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq('id', c.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`Campaign ${status}`); loadCampaigns(); }
    setMenuOpen(null);
  };

  const refundCampaign = async (c: Campaign) => {
    const { error } = await supabase.from('campaigns').update({
      status: 'refunded', updated_at: new Date().toISOString(),
    }).eq('id', c.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`Campaign ${c.title} refunded`); loadCampaigns(); }
    setMenuOpen(null);
  };

  const boostCampaign = async (c: Campaign) => {
    const { error } = await supabase.from('campaigns').update({
      boosted: !c.boosted, boost_multiplier: !c.boosted ? 2.0 : 1.0, updated_at: new Date().toISOString(),
    }).eq('id', c.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`${c.title} ${!c.boosted ? 'boosted 2x' : 'boost removed'}`); loadCampaigns(); }
    setMenuOpen(null);
  };

  // Admin actions
  const addAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) { setActionMsg('Please enter a valid email'); return; }
    const { error } = await supabase.from('super_admins').insert({ email, role: 'super_admin', is_active: true });
    if (error) setActionMsg(error.message);
    else { setActionMsg(`Admin added: ${email}`); setNewAdminEmail(''); loadAdmins(); }
  };

  const removeAdmin = async (admin: SuperAdminRow) => {
    if (admin.email === user?.email) { setActionMsg('You cannot remove yourself'); return; }
    const { error } = await supabase.from('super_admins').delete().eq('id', admin.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`Admin removed: ${admin.email}`); loadAdmins(); }
  };

  const toggleAdmin = async (admin: SuperAdminRow) => {
    const { error } = await supabase.from('super_admins').update({ is_active: !admin.is_active }).eq('id', admin.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`${admin.email} ${!admin.is_active ? 'activated' : 'deactivated'}`); loadAdmins(); }
  };

  // Company actions
  const toggleCompany = async (comp: CompanyStat) => {
    const { error } = await supabase.from('companies').update({ is_active: !comp.is_active }).eq('id', comp.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`${comp.name} ${comp.is_active ? 'suspended' : 'reactivated'}`); loadData(); }
    setMenuOpen(null);
  };
  const changePlan = async (comp: CompanyStat, plan: string) => {
    const { error } = await supabase.from('companies').update({ plan, plan_status: 'active' }).eq('id', comp.id);
    if (error) setActionMsg(error.message);
    else { setActionMsg(`${comp.name} plan changed to ${plan}`); loadData(); }
    setMenuOpen(null);
  };

  if (authLoading || companyLoading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user || !isSuperAdmin) return null;

  const stats = data?.stats;
  const companies = data?.companies ?? [];
  const filteredCompanies = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const filteredVendors = vendorFilter === 'all' ? vendors : vendors.filter((v) => v.status === vendorFilter);
  const filteredCampaigns = campaignFilter === 'all' ? campaigns : campaigns.filter((c) => c.status === campaignFilter);

  const pendingVendors = vendors.filter((v) => v.status === 'pending').length;
  const pendingCampaigns = campaigns.filter((c) => c.status === 'pending').length;
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const campaignRevenue = campaigns.reduce((s, c) => s + c.revenue_cents, 0);
  const adRevenue = campaigns.reduce((s, c) => s + c.spent_cents, 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar title="Super Admin" subtitle="Global platform oversight — vendors, campaigns, and revenue" />

          {error && <MsgBar type="error" msg={error} onClose={() => setError(null)} />}
          {actionMsg && <MsgBar type="success" msg={actionMsg} onClose={() => setActionMsg(null)} />}

          {/* Tab navigation */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
            {TABS.map((t) => {
              const badge = t.id === 'vendors' ? pendingVendors : t.id === 'campaigns' ? pendingCampaigns : 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                    tab === t.id ? 'bg-primary-gradient text-white shadow-glow' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                  {badge > 0 && (
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-bold',
                      tab === t.id ? 'bg-white/20 text-white' : 'bg-warning/10 text-warning'
                    )}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && tab === 'overview' ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {/* ============ OVERVIEW TAB ============ */}
                {tab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: 'Total Companies', value: stats?.total_companies ?? 0, icon: Building2, color: 'bg-primary/10 text-primary' },
                        { label: 'Total Revenue', value: formatCents(stats?.total_revenue_cents ?? 0, 'USD'), icon: DollarSign, color: 'bg-secondary/10 text-secondary' },
                        { label: 'Total Employees', value: stats?.total_employees ?? 0, icon: Users, color: 'bg-accent/10 text-accent' },
                        { label: 'Total Assignments', value: stats?.total_assignments ?? 0, icon: Gift, color: 'bg-warning/10 text-warning' },
                      ].map((card, i) => (
                        <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          className="rounded-2xl border border-border bg-card p-5 shadow-premium">
                          <div className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}><card.icon className="h-5 w-5" /></div>
                          <p className="mt-4 font-display text-2xl font-extrabold">{card.value}</p>
                          <p className="text-sm text-muted-foreground">{card.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Vendor + Campaign quick stats */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <MiniStat label="Pending Vendors" value={pendingVendors} icon={Store} color="text-warning" />
                      <MiniStat label="Pending Campaigns" value={pendingCampaigns} icon={Megaphone} color="text-warning" />
                      <MiniStat label="Active Campaigns" value={activeCampaigns} icon={Zap} color="text-success" />
                      <MiniStat label="Campaign Revenue" value={formatCents(campaignRevenue, 'USD')} icon={DollarSign} color="text-primary" />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-card p-6 shadow-premium lg:col-span-2">
                        <h3 className="font-display text-lg font-bold">New Companies (6 months)</h3>
                        <p className="text-sm text-muted-foreground">Growth trend across the platform</p>
                        <div className="mt-6 h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.monthly_new ?? []}>
                              <defs><linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F96324" stopOpacity={0.3} /><stop offset="95%" stopColor="#F96324" stopOpacity={0} /></linearGradient></defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                              <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                              <Area type="monotone" dataKey="new_companies" stroke="#F96324" strokeWidth={2} fill="url(#gNew)" name="New companies" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                        <h3 className="font-display text-lg font-bold">Plan Distribution</h3>
                        <p className="text-sm text-muted-foreground">Companies by subscription plan</p>
                        <div className="mt-6 h-48">
                          {(() => {
                            const planDist = ['starter', 'business', 'enterprise'].map((p) => ({ name: p, value: companies.filter((c) => c.plan === p).length })).filter((d) => d.value > 0);
                            return planDist.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                                    {planDist.map((d, idx) => <Cell key={idx} fill={PLAN_COLORS[d.name] ?? PIE_COLORS[idx]} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : <div className="grid h-full place-items-center text-sm text-muted-foreground">No data</div>;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Companies table */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
                      <div className="border-b border-border p-4">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                            {filteredCompanies.map((comp) => (
                              <tr key={comp.id} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div><div><p className="font-semibold">{comp.name}</p><p className="text-xs text-muted-foreground">{formatDate(comp.created_at)}</p></div></div></td>
                                <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={{ background: `${PLAN_COLORS[comp.plan]}20`, color: PLAN_COLORS[comp.plan] }}>{comp.plan}</span></td>
                                <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">{comp.employee_count}</td>
                                <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">{comp.assignment_count}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCents(comp.revenue_cents, 'USD')}</td>
                                <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', comp.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}><span className={cn('h-1.5 w-1.5 rounded-full', comp.is_active ? 'bg-success' : 'bg-destructive')} />{comp.is_active ? 'Active' : 'Suspended'}</span></td>
                                <td className="px-4 py-3 text-right"><ActionMenu id={comp.id} menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
                                  <p className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">Change plan</p>
                                  {['starter', 'business', 'enterprise'].map((p) => <button key={p} onClick={() => changePlan(comp, p)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize hover:bg-muted"><Edit2 className="h-3.5 w-3.5" /> {p}</button>)}
                                  <div className="my-1 h-px bg-border" />
                                  <button onClick={() => toggleCompany(comp)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">{comp.is_active ? <><Ban className="h-4 w-4" /> Suspend</> : <><CheckCircle2 className="h-4 w-4" /> Reactivate</>}</button>
                                </ActionMenu></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ VENDOR REVIEW TAB ============ */}
                {tab === 'vendors' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                        <button key={f} onClick={() => setVendorFilter(f)}
                          className={cn('rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all',
                            vendorFilter === f ? 'bg-primary-gradient text-white shadow-glow' : 'bg-muted text-muted-foreground hover:bg-primary/10')}>
                          {f} ({f === 'all' ? vendors.length : vendors.filter((v) => v.status === f).length})
                        </button>
                      ))}
                    </div>

                    {filteredVendors.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No {vendorFilter} vendor applications.</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredVendors.map((app) => (
                          <div key={app.id} className="rounded-2xl border border-border bg-card p-5 shadow-premium">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-start gap-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10"><Store className="h-6 w-6 text-primary" /></div>
                                <div>
                                  <h3 className="font-display text-base font-bold">{app.business_name}</h3>
                                  <p className="text-sm text-muted-foreground">{app.business_type} • {app.city}</p>
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span>{app.contact_name}</span><span>{app.email}</span><span>{app.phone}</span>
                                    <span>Submitted {formatDate(app.created_at)}</span>
                                  </div>
                                  {app.license_url && (
                                    <a href={app.license_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                                      View License Document
                                    </a>
                                  )}
                                  {app.rejection_reason && <p className="mt-2 text-xs text-destructive">Reason: {app.rejection_reason}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={app.status} />
                                {app.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <button onClick={() => reviewVendor(app, 'approved')} className="inline-flex items-center gap-1.5 rounded-xl bg-success/10 px-3 py-2 text-sm font-bold text-success transition-all hover:bg-success/20"><CheckCircle2 className="h-4 w-4" /> Approve</button>
                                    <button onClick={() => reviewVendor(app, 'rejected')} className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive transition-all hover:bg-destructive/20"><XCircle className="h-4 w-4" /> Reject</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ============ CAMPAIGNS TAB ============ */}
                {tab === 'campaigns' && (
                  <div className="space-y-4">
                    {/* Campaign revenue stats */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <MiniStat label="Pending Campaigns" value={pendingCampaigns} icon={Megaphone} color="text-warning" />
                      <MiniStat label="Active Campaigns" value={activeCampaigns} icon={Zap} color="text-success" />
                      <MiniStat label="Campaign Revenue" value={formatCents(campaignRevenue, 'USD')} icon={DollarSign} color="text-primary" />
                      <MiniStat label="Advertising Revenue" value={formatCents(adRevenue, 'USD')} icon={DollarSign} color="text-secondary" />
                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap gap-2">
                      {(['pending', 'active', 'rejected', 'paused', 'completed', 'refunded', 'all'] as const).map((f) => (
                        <button key={f} onClick={() => setCampaignFilter(f)}
                          className={cn('rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all',
                            campaignFilter === f ? 'bg-primary-gradient text-white shadow-glow' : 'bg-muted text-muted-foreground hover:bg-primary/10')}>
                          {f} ({f === 'all' ? campaigns.length : campaigns.filter((c) => c.status === f).length})
                        </button>
                      ))}
                    </div>

                    {filteredCampaigns.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No {campaignFilter} campaigns.</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCampaigns.map((c) => (
                          <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-premium">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-start gap-4">
                                {c.banner_url ? <img src={c.banner_url} alt={c.title} className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary/10"><Megaphone className="h-7 w-7 text-primary" /></div>}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-display text-base font-bold">{c.title}</h3>
                                    {c.boosted && <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary"><Zap className="h-3 w-3" /> Boosted {c.boost_multiplier}x</span>}
                                  </div>
                                  <p className="text-sm text-muted-foreground capitalize">{c.campaign_type.replace('_', ' ')} • {c.placement.replace('_', ' ')}</p>
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {c.impressions.toLocaleString()} impressions</span>
                                    <span className="flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" /> {c.clicks.toLocaleString()} clicks</span>
                                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {formatCents(c.revenue_cents, 'USD')} revenue</span>
                                    <span>Budget: {formatCents(c.budget_cents, 'USD')}</span>
                                  </div>
                                  {c.rejection_reason && <p className="mt-2 text-xs text-destructive">Reason: {c.rejection_reason}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={c.status} />
                                <ActionMenu id={c.id} menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
                                  {c.status === 'pending' && <>
                                    <button onClick={() => reviewCampaign(c, 'active')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-success hover:bg-success/10"><CheckCircle2 className="h-4 w-4" /> Approve</button>
                                    <button onClick={() => reviewCampaign(c, 'rejected')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><XCircle className="h-4 w-4" /> Reject</button>
                                    <div className="my-1 h-px bg-border" />
                                  </>}
                                  {(c.status === 'active' || c.status === 'paused') && <>
                                    <button onClick={() => boostCampaign(c)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-secondary hover:bg-secondary/10"><Zap className="h-4 w-4" /> {c.boosted ? 'Remove Boost' : 'Manual Boost 2x'}</button>
                                    <div className="my-1 h-px bg-border" />
                                  </>}
                                  {(c.status === 'active' || c.status === 'completed') && <button onClick={() => refundCampaign(c)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><RefreshCw className="h-4 w-4" /> Refund Campaign</button>}
                                </ActionMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ============ BANNERS TAB ============ */}
                {tab === 'banners' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                      <h3 className="font-display text-lg font-bold">Campaign Placement Manager</h3>
                      <p className="text-sm text-muted-foreground">Manage which campaigns appear in each banner slot across the platform.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {banners.map((b) => {
                        const assigned = campaigns.find((c) => c.id === b.current_campaign_id);
                        const available = campaigns.filter((c) => c.status === 'active' && c.placement === b.slot_key);
                        return (
                          <div key={b.id} className="rounded-2xl border border-border bg-card p-5 shadow-premium">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-display text-base font-bold">{b.display_name}</h4>
                                <p className="text-xs text-muted-foreground">{b.description}</p>
                                <p className="mt-1 font-mono text-xs text-muted-foreground">{b.slot_key}</p>
                              </div>
                              <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', b.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{b.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="mt-4 border-t border-border pt-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Campaign</p>
                              {assigned ? (
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-sm font-semibold">{assigned.title}</span>
                                  <button onClick={async () => { await supabase.from('banner_placements').update({ current_campaign_id: null }).eq('id', b.id); loadBanners(); }} className="text-xs font-bold text-destructive hover:underline">Unassign</button>
                                </div>
                              ) : (
                                <p className="mt-2 text-sm text-muted-foreground">No campaign assigned</p>
                              )}
                            </div>
                            {available.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assign Campaign</p>
                                <div className="mt-2 space-y-1.5">
                                  {available.slice(0, 5).map((c) => (
                                    <button key={c.id} onClick={async () => { await supabase.from('banner_placements').update({ current_campaign_id: c.id }).eq('id', b.id); loadBanners(); }}
                                      className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-all hover:border-primary hover:bg-primary/5">
                                      <span className="font-medium">{c.title}</span>
                                      <span className="text-xs text-muted-foreground">{c.impressions.toLocaleString()} views</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ============ ADMINS TAB ============ */}
                {tab === 'admins' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                      <h3 className="font-display text-lg font-bold">Manage Super Admins</h3>
                      <p className="text-sm text-muted-foreground">Add or remove super admin access. Only super admins can access this dashboard.</p>
                    </div>

                    {/* Add admin */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <label className="mb-1.5 block text-sm font-semibold">Add new super admin</label>
                          <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="email"
                              placeholder="admin@example.com"
                              value={newAdminEmail}
                              onChange={(e) => setNewAdminEmail(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') addAdmin(); }}
                              className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <button
                          onClick={addAdmin}
                          className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-gradient px-5 font-semibold text-white shadow-glow transition-all hover:scale-[1.02]"
                        >
                          <UserPlus className="h-5 w-5" /> Add Admin
                        </button>
                      </div>
                    </div>

                    {/* Admin list */}
                    <div className="space-y-3">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-premium">
                          <div className="flex items-center gap-4">
                            <div className={cn('grid h-11 w-11 place-items-center rounded-full text-sm font-bold', admin.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                              {admin.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold">{admin.email}</p>
                              <p className="text-xs text-muted-foreground">Added {formatDate(admin.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', admin.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', admin.is_active ? 'bg-success' : 'bg-muted-foreground')} /> {admin.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {admin.email === user?.email ? (
                              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">You</span>
                            ) : (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => toggleAdmin(admin)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                                  title={admin.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {admin.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => removeAdmin(admin)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-destructive transition-all hover:bg-destructive/10"
                                  title="Remove admin"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function MsgBar({ type, msg, onClose }: { type: 'error' | 'success'; msg: string; onClose: () => void }) {
  return (
    <div className={cn('mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm',
      type === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-success/30 bg-success/10 text-success')}>
      {type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />} {msg}
      <button onClick={onClose} className="ml-auto"><X className="h-4 w-4" /></button>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Eye; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted', color)}><Icon className="h-5 w-5" /></div>
      <div><p className="font-display text-lg font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning', approved: 'bg-success/10 text-success', active: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive', paused: 'bg-muted text-muted-foreground',
    completed: 'bg-primary/10 text-primary', refunded: 'bg-secondary/10 text-secondary',
  };
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize', styles[status] ?? 'bg-muted text-muted-foreground')}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function ActionMenu({ id, menuOpen, setMenuOpen, children }: { id: string; menuOpen: string | null; setMenuOpen: (v: string | null) => void; children: React.ReactNode }) {
  return (
    <div className="relative inline-block">
      <button onClick={() => setMenuOpen(menuOpen === id ? null : id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><MoreVertical className="h-4 w-4" /></button>
      {menuOpen === id && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl">{children}</motion.div>
        </>
      )}
    </div>
  );
}
