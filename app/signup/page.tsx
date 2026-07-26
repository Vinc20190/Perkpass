'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { Logo } from '@/components/brand/logo';
import { Spotlight } from '@/components/ui/spotlight';

export default function SignupPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    match: password.length > 0 && password === confirm,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-hover p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-kente opacity-15" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
        <div className="relative">
          <Logo size="md" variant="light" />
        </div>
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-extrabold leading-tight"
          >
            Start your<br />free trial today.
          </motion.h1>
          <p className="mt-4 max-w-sm text-lg text-white/80">
            Join 250,000+ members unlocking premium experiences across Africa. No card required.
          </p>
          <ul className="mt-8 space-y-3">
            {['Unlimited premium offers', 'All 54 African countries', 'Cancel anytime', '14-day free trial'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20"><Check className="h-3.5 w-3.5" /></span>
                <span className="text-white/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">&copy; {new Date().getFullYear()} PerkPass</p>
      </div>

      {/* Right: form */}
      <div className="spotlight-grid flex items-center justify-center bg-background bg-grid p-6">
        <Spotlight />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {t('auth.signup.title')}
          </h2>
          <p className="mt-2 text-muted-foreground">{t('auth.signup.subtitle')}</p>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <Check className="h-4 w-4 shrink-0" />
              Account created! Redirecting to your dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Amara Okafor"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${passwordChecks.length ? 'text-success' : 'text-muted-foreground'}`}>
                    <Check className="h-3 w-3" /> 8+ characters
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
              {confirm.length > 0 && (
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${passwordChecks.match ? 'text-success' : 'text-destructive'}`}>
                    <Check className="h-3 w-3" /> {passwordChecks.match ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary font-semibold text-secondary-foreground shadow-glow-gold transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? t('common.loading') : t('auth.signup.submit')}
              {!loading && !success && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase text-muted-foreground">{t('auth.or')}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.95 2.42-4.37 2.53-4.44-1.38-2.02-3.53-2.3-4.29-2.33-1.83-.18-3.57 1.07-4.5 1.07-.93 0-2.36-1.05-3.88-1.02-2 .03-3.84 1.16-4.87 2.95-2.07 3.59-.53 8.9 1.49 11.81.99 1.43 2.17 3.03 3.72 2.97 1.49-.06 2.05-.96 3.85-.96 1.8 0 2.31.96 3.89.93 1.6-.03 2.62-1.45 3.6-2.89 1.13-1.65 1.6-3.25 1.62-3.33-.04-.02-3.11-1.2-3.14-4.76zM14.02 3.75c.82-1 1.37-2.38 1.22-3.75-1.18.05-2.6.79-3.45 1.78-.76.87-1.43 2.27-1.25 3.62 1.31.1 2.66-.67 3.48-1.65z"/></svg>
              Apple
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.haveAccount')}{' '}
            <Link href="/login" className="font-semibold text-secondary hover:opacity-80">{t('auth.loginLink')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
