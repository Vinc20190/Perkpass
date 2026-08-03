'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode, Plus, Search, X, Loader2, AlertCircle, Gift, Users,
  Calendar, CheckCircle2, Clock, Download, Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents, formatDate, formatDateTime, generateShortCode, initials } from '@/lib/utils';
import type { Employee, RewardCatalogItem, RewardAssignment } from '@/lib/types';

interface AssignmentWithDetails extends RewardAssignment {
  employee?: Employee;
  reward?: RewardCatalogItem;
}

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-success/10 text-success',
  used: 'bg-primary/10 text-primary',
  expired: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  scheduled: 'bg-warning/10 text-warning',
};

export default function AssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rewards, setRewards] = useState<RewardCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModal, setQrModal] = useState<AssignmentWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Assignment form state
  const [selectedReward, setSelectedReward] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !companyLoading && user && !company) router.push('/onboarding');
  }, [authLoading, loading, user, company, router]);

  const loadData = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const [assignRes, empRes, rewardRes] = await Promise.all([
      supabase.from('reward_assignments').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('employees').select('*').eq('company_id', company.id).eq('status', 'active').order('first_name'),
      supabase.from('rewards_catalog').select('*').eq('company_id', company.id).eq('status', 'active').order('name'),
    ]);

    const assignData = (assignRes.data as RewardAssignment[]) ?? [];
    const empData = (empRes.data as Employee[]) ?? [];
    const rewardData = (rewardRes.data as RewardCatalogItem[]) ?? [];

    const enriched = assignData.map((a) => ({
      ...a,
      employee: empData.find((e) => e.id === a.employee_id),
      reward: rewardData.find((r) => r.id === a.reward_id),
    }));

    setAssignments(enriched);
    setEmployees(empData);
    setRewards(rewardData);
    setLoading(false);
  }, [company]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = assignments.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      const empName = a.employee ? `${a.employee.first_name} ${a.employee.last_name}`.toLowerCase() : '';
      const rewardName = (a.reward?.name ?? '').toLowerCase();
      if (!empName.includes(q) && !rewardName.includes(q)) return false;
    }
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !user) return;
    if (!selectedReward || selectedEmployees.length === 0) {
      setError('Select a reward and at least one employee');
      return;
    }

    setSaving(true);
    setError(null);

    const reward = rewards.find((r) => r.id === selectedReward);
    if (!reward) { setError('Reward not found'); setSaving(false); return; }

    const rows = selectedEmployees.map((empId) => ({
      company_id: company.id,
      reward_id: selectedReward,
      employee_id: empId,
      assigned_by: user.id,
      status: scheduledFor ? 'scheduled' : 'available',
      short_code: generateShortCode(),
      value_cents: reward.value_cents,
      currency_code: reward.currency_code,
      message: message || null,
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : reward.expires_at,
    }));

    const { data: created, error: insertErr } = await supabase.from('reward_assignments').insert(rows).select('*');

    if (insertErr) {
      setError(insertErr.message);
      setSaving(false);
      return;
    }

    // Create notifications for each employee's user (if linked)
    if (created && user) {
      const notifRows = (created as RewardAssignment[]).map((a) => {
        const emp = employees.find((e) => e.id === a.employee_id);
        return emp?.user_id ? {
          user_id: emp.user_id,
          company_id: company.id,
          type: 'new_reward',
          title: `New reward: ${reward.name}`,
          body: message || `You've received a ${reward.name} reward worth ${formatCents(reward.value_cents, reward.currency_code)}.`,
          metadata: { assignment_id: a.id, reward_id: reward.id },
        } : null;
      }).filter((n): n is NonNullable<typeof n> => n !== null);

      if (notifRows.length > 0) {
        await supabase.from('notifications').insert(notifRows);
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        company_id: company.id,
        actor_id: user.id,
        action: `assigned_reward:${reward.name}`,
        entity_type: 'reward_assignment',
        metadata: { count: created.length, reward_id: reward.id },
      });
    }

    setSaving(false);
    setModalOpen(false);
    setSelectedReward(''); setSelectedEmployees([]); setMessage(''); setExpiresAt(''); setScheduledFor('');
    loadData();
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from('reward_assignments').update({ status: 'cancelled' }).eq('id', id);
    if (error) setError(error.message); else loadData();
  };

  const downloadQR = (assignment: AssignmentWithDetails) => {
    const svg = document.getElementById(`qr-${assignment.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${assignment.short_code}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;
  if (!company) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title="Reward Assignments"
            subtitle={`${assignments.length} total assignments`}
            actions={
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" /> Assign Reward
              </button>
            }
          />

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by employee or reward..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="used">Used</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-border bg-card py-20 text-center">
              <QrCode className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="font-semibold text-foreground">No assignments yet</p>
              <p className="text-sm text-muted-foreground">Assign rewards to employees to generate QR codes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-premium sm:flex-row sm:items-center"
                >
                  {/* Employee */}
                  <div className="flex items-center gap-3 sm:w-56">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">
                      {a.employee ? initials(a.employee.first_name, a.employee.last_name) : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : 'Unknown'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{a.employee?.position ?? '—'}</p>
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="flex flex-1 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{a.reward?.name ?? 'Unknown reward'}</p>
                      <p className="text-xs text-muted-foreground">{formatCents(a.value_cents, a.currency_code)}</p>
                    </div>
                  </div>

                  {/* Status + dates */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Assigned</p>
                      <p className="text-xs font-medium text-foreground">{formatDate(a.created_at)}</p>
                    </div>
                    {a.expires_at && (
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-xs font-medium text-foreground">{formatDate(a.expires_at)}</p>
                      </div>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[a.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {a.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(a.status === 'available' || a.status === 'scheduled') && (
                      <button
                        onClick={() => setQrModal(a)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-semibold text-white transition-colors hover:bg-foreground/85"
                      >
                        <QrCode className="h-4 w-4" /> View QR
                      </button>
                    )}
                    {a.status !== 'cancelled' && a.status !== 'used' && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign reward modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-foreground">Assign Reward</h2>
                <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {rewards.length === 0 ? (
                <div className="mt-6 rounded-xl bg-muted/40 p-6 text-center">
                  <Gift className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
                  <p className="font-semibold text-foreground">No active rewards</p>
                  <p className="text-sm text-muted-foreground">Create rewards in the catalog first.</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="mt-6 rounded-xl bg-muted/40 p-6 text-center">
                  <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
                  <p className="font-semibold text-foreground">No active employees</p>
                  <p className="text-sm text-muted-foreground">Add employees first.</p>
                </div>
              ) : (
                <form onSubmit={handleAssign} className="mt-5 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select reward <span className="text-primary">*</span></label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {rewards.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedReward(r.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            selectedReward === r.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCents(r.value_cents, r.currency_code)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Select employees ({selectedEmployees.length} selected) <span className="text-primary">*</span></label>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border p-2">
                      {employees.map((emp) => (
                        <label
                          key={emp.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted ${
                            selectedEmployees.includes(emp.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                            className="h-4 w-4 rounded border-input accent-primary"
                          />
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">
                            {initials(emp.first_name, emp.last_name)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{emp.first_name} {emp.last_name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{emp.position ?? ''}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => setSelectedEmployees(employees.map((e) => e.id))} className="text-xs font-semibold text-primary hover:underline">Select all</button>
                      <button type="button" onClick={() => setSelectedEmployees([])} className="text-xs font-semibold text-muted-foreground hover:underline">Clear</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">Schedule for (optional)</label>
                      <input type="date" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">Expires at (optional)</label>
                      <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Personal message (optional)</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className={inputCls} placeholder="Great work this quarter! Enjoy this treat." />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="h-11 rounded-xl border border-border px-5 font-semibold text-foreground hover:bg-muted">Cancel</button>
                    <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-glow hover:bg-primary-hover disabled:opacity-60">
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Assign to {selectedEmployees.length} {selectedEmployees.length === 1 ? 'employee' : 'employees'}</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR modal */}
      <AnimatePresence>
        {qrModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setQrModal(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl"
            >
              <h3 className="font-display text-lg font-extrabold text-foreground">Reward QR Code</h3>
              <p className="text-sm text-muted-foreground">{qrModal.reward?.name}</p>

              <div className="mt-5 grid place-items-center rounded-2xl border-2 border-primary/20 bg-white p-6">
                <QRCodeSVG
                  id={`qr-${qrModal.id}`}
                  value={qrModal.qr_token}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-4 space-y-2 text-left text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-semibold text-foreground">{qrModal.employee ? `${qrModal.employee.first_name} ${qrModal.employee.last_name}` : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono font-bold text-primary">{qrModal.short_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-semibold text-foreground">{formatCents(qrModal.value_cents, qrModal.currency_code)}</span>
                </div>
                {qrModal.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-semibold text-foreground">{formatDateTime(qrModal.expires_at)}</span>
                  </div>
                )}
              </div>

              {qrModal.message && (
                <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                  "{qrModal.message}"
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => downloadQR(qrModal)}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border font-semibold text-foreground hover:bg-muted"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
                <button
                  onClick={() => setQrModal(null)}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-glow hover:bg-primary-hover"
                >
                  <CheckCircle2 className="h-4 w-4" /> Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = 'h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
