'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Settings, Loader2, Save, AlertCircle, Check, Building2,
  Palette, Globe, Wallet, FileText, Plus, Trash2, Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { FileUpload } from '@/components/ui/file-upload';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import type { Company, Department } from '@/lib/types';

const TIMEZONES = ['UTC', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Accra', 'Africa/Johannesburg', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Kigali', 'Africa/Addis_Ababa'];
const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'fr', label: 'French' }, { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' }, { code: 'sw', label: 'Swahili' },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { company, refreshCompany, departments, refreshDepartments, loading: companyLoading } = useCompany();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company form
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#F96324');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultLang, setDefaultLang] = useState('en');
  const [annualBudget, setAnnualBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');

  // Departments
  const [newDept, setNewDept] = useState('');
  const [deptSaving, setDeptSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !companyLoading && user && !company) router.push('/onboarding');
  }, [authLoading, companyLoading, user, company, router]);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setLogoUrl(company.logo_url ?? '');
      setBrandColor(company.brand_color ?? '#F96324');
      setAddress(company.address ?? '');
      setEmail(company.email ?? '');
      setPhone(company.phone ?? '');
      setVatNumber(company.vat_number ?? '');
      setTimezone(company.timezone);
      setDefaultLang(company.default_language);
      setAnnualBudget(String(company.annual_budget_cents / 100));
      setMonthlyBudget(String(company.monthly_budget_cents / 100));
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('companies').update({
      name, logo_url: logoUrl || null, brand_color: brandColor,
      address: address || null, email: email || null, phone: phone || null,
      vat_number: vatNumber || null, timezone, default_language: defaultLang,
      annual_budget_cents: Math.round((parseFloat(annualBudget) || 0) * 100),
      monthly_budget_cents: Math.round((parseFloat(monthlyBudget) || 0) * 100),
      updated_at: new Date().toISOString(),
    }).eq('id', company.id);

    setSaving(false);
    if (error) { setError(error.message); } else { setSaved(true); refreshCompany(); setTimeout(() => setSaved(false), 3000); }
  };

  const addDepartment = async () => {
    if (!company || !newDept.trim()) return;
    setDeptSaving(true);
    const { error } = await supabase.from('departments').insert({
      company_id: company.id, name: newDept.trim(),
    });
    if (error) setError(error.message);
    else { setNewDept(''); refreshDepartments(); }
    setDeptSaving(false);
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) setError(error.message); else refreshDepartments();
  };

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;
  if (!company) return null;

  const inputCls = 'h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-4xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar title="Settings" subtitle="Manage your company profile and preferences" />

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              <button onClick={() => setError(null)} className="ml-auto text-destructive"><span>×</span></button>
            </div>
          )}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
            >
              <Check className="h-4 w-4" /> Settings saved successfully.
            </motion.div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Company profile */}
            <Section icon={Building2} title="Company Profile">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" required>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Company Logo">
                  <FileUpload
                    bucket="company-assets"
                    folderId={company.id}
                    value={logoUrl}
                    onChange={(url) => setLogoUrl(url)}
                    label=""
                    hint="JPG, PNG, WebP up to 5MB"
                    maxSizeMB={5}
                  />
                </Field>
                <Field label="Address">
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Email">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Phone">
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                </Field>
                <Field label="VAT / Tax number">
                  <input type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} className={inputCls} />
                </Field>
              </div>
            </Section>

            {/* Branding */}
            <Section icon={Palette} title="Branding">
              <div className="flex items-center gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Brand color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-input" />
                    <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            </Section>

            {/* Localization */}
            <Section icon={Globe} title="Localization">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Timezone">
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </Field>
                <Field label="Default language">
                  <select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} className={inputCls}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            {/* Budgets */}
            <Section icon={Wallet} title="Budgets">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`Annual budget (${company.currency_code})`}>
                  <input type="number" step="0.01" min="0" value={annualBudget} onChange={(e) => setAnnualBudget(e.target.value)} className={inputCls} />
                </Field>
                <Field label={`Monthly budget (${company.currency_code})`}>
                  <input type="number" step="0.01" min="0" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className={inputCls} />
                </Field>
              </div>
            </Section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
              </button>
            </div>
          </form>

          {/* Departments */}
          <Section icon={Users} title="Departments" className="mt-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDepartment(); } }}
                placeholder="Department name (e.g. Engineering)"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addDepartment}
                disabled={deptSaving || !newDept.trim()}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {departments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No departments yet. Add one above.</p>
              ) : (
                departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <span className="font-medium text-foreground">{dept.name}</span>
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, className }: { icon: React.ElementType; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-premium ${className ?? ''}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}{required && <span className="text-primary"> *</span>}</label>
      {children}
    </div>
  );
}
