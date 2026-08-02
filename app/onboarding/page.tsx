'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, ArrowRight, ArrowLeft, AlertCircle, Check, Loader2,
  Globe, Users, CreditCard, Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { slugify, cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';
import { Spotlight } from '@/components/ui/spotlight';

const COUNTRY_OPTIONS = [
  { code: 'NG', label: 'Nigeria', currency: '₦ NGN' },
  { code: 'KE', label: 'Kenya', currency: 'KSh KES' },
  { code: 'GH', label: 'Ghana', currency: '₵ GHS' },
  { code: 'ZA', label: 'South Africa', currency: 'R ZAR' },
  { code: 'EG', label: 'Egypt', currency: 'E£ EGP' },
  { code: 'MA', label: 'Morocco', currency: 'DH MAD' },
  { code: 'UG', label: 'Uganda', currency: 'USh UGX' },
  { code: 'RW', label: 'Rwanda', currency: 'FRw RWF' },
  { code: 'CI', label: "Côte d'Ivoire", currency: 'CFA XOF' },
  { code: 'CM', label: 'Cameroon', currency: 'FCFA XAF' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', desc: 'Up to 10 employees', price: 'Free', features: ['Basic rewards', '1 country', 'Email support'] },
  { id: 'business', name: 'Business', desc: 'Up to 100 employees', price: '$99/mo', features: ['Custom rewards', '5 countries', 'Analytics', 'Priority support'], popular: true },
  { id: 'enterprise', name: 'Enterprise', desc: 'Unlimited', price: 'Custom', features: ['Unlimited everything', 'All 54 countries', 'Dedicated manager', 'API access'] },
];

const STEPS = ['Company', 'Country', 'Plan', 'Review'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    companyName: '',
    companySize: '1-10',
    industry: 'Technology',
    countryCode: 'NG',
    plan: 'business',
  });

  const update = (field: string, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    setError(null);
  };

  const validateStep = (s: number): boolean => {
    if (s === 0 && !data.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    return true;
  };

  const next = () => {
    if (validateStep(step)) {
      setError(null);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleCreate = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);

    const { data: country } = await supabase
      .from('countries')
      .select('id, currency_code')
      .eq('iso_code', data.countryCode)
      .maybeSingle();

    if (!country) {
      setError('Selected country not found');
      setLoading(false);
      return;
    }

    let slug = slugify(data.companyName);
    const { data: existing } = await supabase.from('companies').select('slug').eq('slug', slug).maybeSingle();
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: companyRow, error: companyErr } = await supabase
      .from('companies')
      .insert({
        name: data.companyName,
        slug,
        country_id: (country as { id: string }).id,
        currency_code: (country as { currency_code: string }).currency_code,
        plan: data.plan,
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
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={i} className="flex flex-1 items-center">
                  <div className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition-all',
                    i < step && 'bg-success text-white',
                    i === step && 'bg-primary-gradient text-white shadow-glow',
                    i > step && 'bg-muted text-muted-foreground'
                  )}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('h-0.5 flex-1 rounded-full transition-all', i < step ? 'bg-success' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {STEPS.map((label, i) => (
                <span key={i} className={cn(
                  'flex-1 text-center text-[10px] font-bold uppercase tracking-wider',
                  i === step ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-foreground">{STEPS[step]} Setup</h1>
              <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {/* Step 0: Company */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Company name</label>
                    <input
                      type="text"
                      required
                      value={data.companyName}
                      onChange={(e) => update('companyName', e.target.value)}
                      placeholder="Acme Africa Ltd"
                      className="h-12 w-full rounded-xl border border-input bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Company size</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1-10', '11-50', '51-200', '200+'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => update('companySize', s)}
                          className={cn(
                            'rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all',
                            data.companySize === s
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Industry</label>
                    <select
                      value={data.industry}
                      onChange={(e) => update('industry', e.target.value)}
                      className="h-12 w-full rounded-xl border border-input bg-card px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Hospitality', 'Other'].map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 1: Country */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" /> Select your primary operating country
                  </div>
                  <div className="grid gap-2">
                    {COUNTRY_OPTIONS.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => update('countryCode', c.code)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                          data.countryCode === c.code
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div>
                          <p className="font-semibold">{c.label}</p>
                          <p className="text-xs text-muted-foreground">{c.currency}</p>
                        </div>
                        {data.countryCode === c.code && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Plan */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" /> Choose your plan (14-day free trial)
                  </div>
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update('plan', p.id)}
                      className={cn(
                        'w-full rounded-xl border p-4 text-left transition-all',
                        data.plan === p.id
                          ? 'border-primary bg-primary/10 shadow-glow'
                          : 'border-border hover:border-primary/40',
                        p.popular && data.plan !== p.id && 'ring-1 ring-primary/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg font-extrabold">{p.price}</p>
                          {p.popular && <span className="text-xs font-bold text-primary">Popular</span>}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.features.map((f) => (
                          <span key={f} className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <ReviewRow icon={Building2} label="Company" value={data.companyName} />
                    <ReviewRow icon={Users} label="Size" value={data.companySize} />
                    <ReviewRow icon={Building2} label="Industry" value={data.industry} />
                    <ReviewRow icon={Globe} label="Country" value={COUNTRY_OPTIONS.find((c) => c.code === data.countryCode)?.label ?? data.countryCode} />
                    <ReviewRow icon={CreditCard} label="Plan" value={PLANS.find((p) => p.id === data.plan)?.name ?? data.plan} />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
                    <Check className="h-4 w-4 shrink-0" /> 14-day free trial — no card required
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0 || loading}
              className="inline-flex h-12 items-center gap-1.5 rounded-xl px-4 font-semibold text-muted-foreground transition-all hover:bg-muted disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-gradient px-6 font-semibold text-white shadow-glow transition-all hover:scale-[1.02]"
              >
                Continue <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-gradient px-6 font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-5 w-5" /> Create Workspace</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ReviewRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 last:border-0">
      <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
