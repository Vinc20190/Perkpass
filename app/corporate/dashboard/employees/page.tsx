'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Download, Upload, MoreVertical, Edit2,
  Trash2, Ban, CheckCircle2, X, Loader2, AlertCircle, ChevronLeft,
  ChevronRight, Mail, Phone, Filter, ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { initials, formatDate } from '@/lib/utils';
import type { Employee, Department } from '@/lib/types';

const PAGE_SIZE = 10;

type SortField = 'first_name' | 'last_name' | 'email' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, departments, refreshDepartments } = useCompany();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const loadEmployees = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
    setEmployees((data as Employee[]) ?? []);
    setLoading(false);
  }, [company]);

  useEffect(() => {
    loadEmployees();
    refreshDepartments();
  }, [loadEmployees, refreshDepartments]);

  const filtered = useMemo(() => {
    let result = employees;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.position ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }
    if (deptFilter !== 'all') {
      result = result.filter((e) => e.department_id === deptFilter);
    }
    result = [...result].sort((a, b) => {
      let av: string | number = a[sortField];
      let bv: string | number = b[sortField];
      if (sortField === 'created_at') {
        av = new Date(av as string).getTime();
        bv = new Date(bv as string).getTime();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [employees, search, statusFilter, deptFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSave = async (data: Partial<Employee>) => {
    if (!company) return;
    setSaving(true);
    setError(null);

    if (editing) {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          department_id: data.department_id,
          status: data.status,
          hired_at: data.hired_at,
        })
        .eq('id', editing.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('employees').insert({
        company_id: company.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department_id: data.department_id,
        status: data.status ?? 'active',
        hired_at: data.hired_at,
      });
      if (error) setError(error.message);
    }

    setSaving(false);
    if (!error) {
      setModalOpen(false);
      setEditing(null);
      loadEmployees();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      loadEmployees();
    }
    setMenuOpen(null);
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.from('employees').update({ status: newStatus }).eq('id', emp.id);
    if (error) {
      setError(error.message);
    } else {
      loadEmployees();
    }
    setMenuOpen(null);
  };

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Status', 'Hired At'];
    const rows = filtered.map((e) => [
      e.first_name, e.last_name, e.email, e.phone ?? '', e.position ?? '',
      e.status, e.hired_at ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = async (file: File) => {
    if (!company) return;
    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return;
    const parsed = lines.slice(1).map((line) => {
      const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
      return {
        company_id: company.id,
        first_name: cols[0] ?? '',
        last_name: cols[1] ?? '',
        email: cols[2] ?? '',
        phone: cols[3] || null,
        position: cols[4] || null,
        status: (cols[5] as Employee['status']) || 'active',
        hired_at: cols[6] || null,
      };
    }).filter((r) => r.first_name && r.email);

    const { error } = await supabase.from('employees').insert(parsed);
    if (error) {
      setError(error.message);
    } else {
      loadEmployees();
    }
  };

  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? 'Unassigned';

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;
  if (!company) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title="Employees"
            subtitle={`${filtered.length} ${filtered.length === 1 ? 'employee' : 'employees'}`}
            actions={
              <>
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                  <Upload className="h-4 w-4" /> Import
                  <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) importCSV(e.target.files[0]); e.target.value = ''; }} />
                </label>
                <button onClick={exportCSV} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                  <Download className="h-4 w-4" /> Export
                </button>
                <button
                  onClick={() => { setEditing(null); setModalOpen(true); }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4" /> Add Employee
                </button>
              </>
            }
          />

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="h-10 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
            {loading ? (
              <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : paged.length === 0 ? (
              <div className="grid place-items-center py-20 text-center">
                <Users className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="font-semibold text-foreground">No employees found</p>
                <p className="text-sm text-muted-foreground">Add your first employee or adjust filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="cursor-pointer px-4 py-3 text-left font-semibold text-muted-foreground" onClick={() => toggleSort('first_name')}>
                        <span className="flex items-center gap-1">Employee <ArrowUpDown className="h-3 w-3" /></span>
                      </th>
                      <th className="cursor-pointer px-4 py-3 text-left font-semibold text-muted-foreground" onClick={() => toggleSort('email')}>
                        <span className="flex items-center gap-1">Contact <ArrowUpDown className="h-3 w-3" /></span>
                      </th>
                      <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground lg:table-cell">Department</th>
                      <th className="cursor-pointer px-4 py-3 text-left font-semibold text-muted-foreground" onClick={() => toggleSort('status')}>
                        <span className="flex items-center gap-1">Status <ArrowUpDown className="h-3 w-3" /></span>
                      </th>
                      <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground sm:table-cell">Hired</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((emp) => (
                      <tr key={emp.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">
                              {initials(emp.first_name, emp.last_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{emp.first_name} {emp.last_name}</p>
                              <p className="text-xs text-muted-foreground">{emp.position ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {emp.email}</p>
                          {emp.phone && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {emp.phone}</p>}
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{deptName(emp.department_id)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            emp.status === 'active' ? 'bg-success/10 text-success' :
                            emp.status === 'suspended' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              emp.status === 'active' ? 'bg-success' :
                              emp.status === 'suspended' ? 'bg-warning' : 'bg-muted-foreground'
                            }`} />
                            {emp.status}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDate(emp.hired_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setMenuOpen(menuOpen === emp.id ? null : emp.id)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            <AnimatePresence>
                              {menuOpen === emp.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl"
                                  >
                                    <button onClick={() => { setEditing(emp); setModalOpen(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      <Edit2 className="h-4 w-4" /> Edit
                                    </button>
                                    <button onClick={() => handleToggleStatus(emp)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                                      {emp.status === 'active' ? <><Ban className="h-4 w-4" /> Suspend</> : <><CheckCircle2 className="h-4 w-4" /> Reactivate</>}
                                    </button>
                                    <button onClick={() => handleDelete(emp.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages} · {filtered.length} total
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EmployeeModal
        open={modalOpen}
        editing={editing}
        departments={departments}
        saving={saving}
        error={error}
        onClose={() => { setModalOpen(false); setEditing(null); setError(null); }}
        onSave={handleSave}
      />
    </div>
  );
}

function EmployeeModal({
  open, editing, departments, saving, error, onClose, onSave,
}: {
  open: boolean;
  editing: Employee | null;
  departments: Department[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState<Employee['status']>('active');
  const [hiredAt, setHiredAt] = useState('');

  useEffect(() => {
    if (editing) {
      setFirstName(editing.first_name);
      setLastName(editing.last_name);
      setEmail(editing.email);
      setPhone(editing.phone ?? '');
      setPosition(editing.position ?? '');
      setDepartmentId(editing.department_id ?? '');
      setStatus(editing.status);
      setHiredAt(editing.hired_at ?? '');
    } else {
      setFirstName(''); setLastName(''); setEmail(''); setPhone('');
      setPosition(''); setDepartmentId(''); setStatus('active'); setHiredAt('');
    }
  }, [editing, open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-foreground">
              {editing ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); onSave({ first_name: firstName, last_name: lastName, email, phone: phone || null, position: position || null, department_id: departmentId || null, status, hired_at: hiredAt || null }); }}
            className="mt-5 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" required>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Last name" required>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Email" required>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Position">
                <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Department">
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputCls}>
                  <option value="">Unassigned</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value as Employee['status'])} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <Field label="Hired date">
              <input type="date" value={hiredAt} onChange={(e) => setHiredAt(e.target.value)} className={inputCls} />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="h-11 rounded-xl border border-border px-5 font-semibold text-foreground hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-glow hover:bg-primary-hover disabled:opacity-60">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? 'Save changes' : 'Add employee'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const inputCls = 'h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}{required && <span className="text-primary"> *</span>}</label>
      {children}
    </div>
  );
}
