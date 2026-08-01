'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe, Sun, Moon, Bell, Search, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n/context';
import { LOCALES } from '@/lib/i18n/locales';
import { CURRENCIES } from '@/lib/i18n/currencies';
import { Logo } from '@/components/brand/logo';
import { useAuth } from '@/lib/auth/context';

interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { label: 'Categories', href: '/categories' },
  { label: 'Offers', href: '/pricing' },
  { label: 'My Perks', href: '/dashboard' },
  { label: 'Partners', href: '/partners' },
  { label: 'Vendor', href: '/vendor' },
];

const SECONDARY_LINKS: NavLink[] = [
  { label: 'Admin', href: '/super-admin' },
  { label: 'HR Dashboard', href: '/corporate/dashboard' },
  { label: 'Corporate', href: '/corporate' },
  { label: 'For Business', href: '/business' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const { t, locale, setLocale, currency, setCurrency } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-border/60 shadow-card'
          : 'bg-card/95 border-b border-border/40'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center transition-transform hover:scale-105" aria-label="PerkPass home">
          <Logo size="sm" />
        </Link>

        {/* Desktop primary nav */}
        <div className="hidden items-center gap-1 lg:flex" role="menubar">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(v => !v)}
              role="menuitem"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                SECONDARY_LINKS.some(l => isActive(l.href))
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card absolute left-0 top-full mt-2 w-56 rounded-2xl p-2"
                  role="menu"
                >
                  {SECONDARY_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            className="hidden h-9 w-9 place-items-center rounded-xl text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary sm:grid"
            aria-label="Search offers"
          >
            <Search className="h-5 w-5" />
          </button>

          {mounted && (
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-xl text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          {/* Language / currency */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(v => !v)}
              aria-expanded={langOpen}
              aria-haspopup="true"
              aria-label="Change language and currency"
              className="flex h-9 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden uppercase sm:inline">{locale}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card absolute right-0 top-full mt-2 w-64 rounded-2xl p-4"
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
              )}
            </AnimatePresence>
          </div>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/vendor"
                className="hidden items-center gap-1.5 rounded-xl border border-primary/30 px-3 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/10 md:flex"
              >
                <Store className="h-4 w-4" /> Become a Vendor
              </Link>
              <button
                className="relative grid h-9 w-9 place-items-center rounded-xl text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card" />
              </button>
              <Link
                href="/dashboard"
                className="btn-shine hidden items-center rounded-xl bg-primary-gradient px-4 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 sm:flex"
              >
                {t('nav.dashboard')}
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                href="/vendor"
                className="hidden items-center gap-1.5 rounded-xl border border-primary/30 px-3 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/10 md:flex"
              >
                <Store className="h-4 w-4" /> Become a Vendor
              </Link>
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/signup"
                className="btn-shine flex items-center rounded-xl bg-primary-gradient px-4 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105"
              >
                {t('nav.signup')}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl text-foreground transition-colors hover:bg-primary/10 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-card shadow-float lg:hidden"
            >
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
              <div className="flex flex-col gap-1 px-4 py-4">
                {[...PRIMARY_LINKS, ...SECONDARY_LINKS].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary-gradient text-white'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <Link
                    href="/vendor"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 py-3 text-center font-bold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Store className="h-4 w-4" /> Become a Vendor
                  </Link>
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="btn-shine flex items-center justify-center rounded-xl bg-primary-gradient px-4 py-3 text-center font-bold text-white shadow-glow"
                    >
                      {t('nav.dashboard')}
                    </Link>
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
                        className="btn-shine flex items-center justify-center rounded-xl bg-primary-gradient px-4 py-3 text-center font-bold text-white shadow-glow"
                      >
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
