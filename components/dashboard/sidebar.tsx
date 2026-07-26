'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Gift, QrCode, BarChart3, Settings,
  Bell, Menu, X, LogOut, ChevronDown, Building2, Shield, Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/employees', label: 'Employees', icon: Users },
  { href: '/dashboard/rewards', label: 'Rewards', icon: Gift },
  { href: '/dashboard/assignments', label: 'Assignments', icon: QrCode },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const ADMIN_ITEMS = [
  { href: '/super-admin', label: 'Super Admin', icon: Shield },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { company, role, isSuperAdmin } = useCompany();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const items = [...NAV_ITEMS, ...(isSuperAdmin ? ADMIN_ITEMS : [])];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const sidebarContent = (
    <>
      <div className="px-5 py-5">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </div>

      {company && (
        <div className="mx-3 mb-4 rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{company.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{company.plan} plan · {role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="relative">
          <button
            onClick={() => setUserMenu((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-sm font-bold text-secondary">
              {(user?.user_metadata?.full_name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.user_metadata?.full_name ?? 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {userMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border bg-card p-1.5 shadow-xl"
              >
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function DashboardTopBar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
