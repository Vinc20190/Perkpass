'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, AlertCircle, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { slugify } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';
import { Spotlight } from '@/components/ui/spotlight';

const COUNTRY_OPTIONS = [
  { code: 'NG', label: 'Nigeria (₦ NGN)' },
  { code: 'KE', label: 'Kenya (KSh KES)' },
  { code: 'GH', label: 'Ghana (₵ GHS)' },
  { code: 'ZA', label: 'South Africa (R ZAR)' },
  { code: 'EG', label: 'Egypt (E£ EGP)' },
  { code: 'MA', label: 'Morocco (DH MAD)' },
  { code: 'UG', label: 'Uganda (USh UGX)' },
  { code: 'RW', label: 'Rwanda (FRw RWF)' },
  { code: 'CI', label: "Côte d'Ivoire (CFA XOF)" },
  { code: 'CM', label: 'Cameroon (FCFA XAF)' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [countryCode, setCountryCode] = useState('NG');
  const [plan, setPlan] = useState('business');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);

    const { data: country } = await supabase
      .from('countries')
      .select('id, currency_code')
      .eq('iso_code', countryCode)
      .maybeSingle();

    if (!country) {
      setError('Selected country not found');
      setLoading(false);
      return;
    }

    let slug = slugify(companyName);
    const { data: existing } = await supabase.from('companies').select('slug').eq('slug', slug).maybeSingle();
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: companyRow, error: companyErr } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        slug,
        country_id: (country as { id: string }).id,
        currency_code: (country as { currency_code: string }).currency_code,
        plan,
        plan_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (companyErr || !companyRow) {
      setError(companyErr?.message ?? 'Failed to create company');
      setLoading(false);
      return;
    }

    const { error: memberErr } = await supabase.from('company_members').insert({
      company_id: (companyRow as { id: string }).id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberErr) {
      setError(memberErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="spotlight-grid grid min-h-screen place-items-center bg-background bg-grid p-6">
      <Spotlight />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-premium">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-foreground">Set up your company</h1>
              <p className="text-sm text-muted-foreground">Create your workspace to start rewarding your team.</p>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Company name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Africa Ltd"
                className="h-12 w-full rounded-xl border border-input bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Country</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-card px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {['starter', 'business', 'enterprise'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-all ${
                      plan === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
              <Check className="h-4 w-4 shrink-0" /> 14-day free trial — no card required
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create workspace <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
