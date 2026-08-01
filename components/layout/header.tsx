'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ChevronDown, Globe, Sun, Moon, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n/context';
import { LOCALES } from '@/lib/i18n/locales';
import { CURRENCIES } from '@/lib/i18n/currencies';
import { Logo } from '@/components/brand/logo';
import { useAuth } from '@/lib/auth/context';

const NAV_LINKS = [
  { key: 'nav.pricing', href: '/pricing' },
  { key: 'nav.partners', href: '/partners' },
  { key: 'nav.cities', href: '/cities' },
  { key: 'nav.categories', href: '/categories' },
  { key: 'nav.corporate', href: '/corporate' },
  { key: 'nav.business', href: '/business' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.contact', href: '/contact' },
];

export function Header() {
  const { t, locale, setLocale, currency, setCurrency } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [pathname]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-white/20 shadow-premium dark:border-white/10'
          : 'bg-transparent'
      }`}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 transition-transform hover:scale-105" aria-label="PerkPass home">
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.slice(0, 5).map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`nav-underline rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(link.key as never)}
            </Link>
          ))}
          <div className="group relative">
            <button className="nav-underline flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t('nav.more' as never) || 'More'} <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
              <div className="glass-card grid w-56 grid-cols-1 gap-1 rounded-2xl p-2">
                {NAV_LINKS.slice(5).map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      pathname === link.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    {t(link.key as never)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button
            className="hidden h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary sm:grid"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* Language + currency */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex h-9 items-center gap-1 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
              aria-label="Language and currency"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden uppercase sm:inline">{locale}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="glass-card absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl p-4"
                  >
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('common.language')}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {LOCALES.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLocale(l.code); setLangOpen(false); }}
                          className={`rounded-xl px-2.5 py-2 text-left text-sm transition-all ${
                            locale === l.code
                              ? 'bg-primary-gradient font-bold text-white'
                              : 'hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          {l.nativeLabel}
                        </button>
                      ))}
                    </div>
                    <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('common.currency')}
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.values(CURRENCIES).slice(0, 12).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrency(c.code); setLangOpen(false); }}
                          className={`rounded-lg px-2 py-1.5 text-center text-xs font-bold transition-all ${
                            currency === c.code
                              ? 'bg-primary-gradient text-white'
                              : 'hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          {c.symbol} {c.code}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                className="relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
              </button>
              <Link
                href="/dashboard"
                className="btn-shine hidden items-center gap-1.5 rounded-xl bg-primary-gradient px-4 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 sm:flex"
              >
                <Sparkles className="h-4 w-4" />
                {t('nav.dashboard')}
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/signup"
                className="btn-shine flex items-center gap-1.5 rounded-xl bg-primary-gradient px-4 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                {t('nav.signup')}
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl text-foreground transition-colors hover:bg-primary/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-card shadow-float lg:hidden"
            >
              {/* Mobile header */}
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile nav links */}
              <div className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base font-medium transition-all ${
                      pathname === link.href
                        ? 'bg-primary-gradient text-white'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {t(link.key as never)}
                  </Link>
                ))}

                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="btn-shine flex items-center justify-center gap-2 rounded-xl bg-primary-gradient px-4 py-3 text-center font-bold text-white shadow-glow"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                      <button
                        onClick={() => { signOut(); setMobileOpen(false); }}
                        className="rounded-xl border border-border px-4 py-3 text-center font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl border border-border px-4 py-3 text-center font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        {t('nav.login')}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="btn-shine flex items-center justify-center gap-2 rounded-xl bg-primary-gradient px-4 py-3 text-center font-bold text-white shadow-glow"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t('nav.signup')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
