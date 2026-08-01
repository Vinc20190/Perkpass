'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, center, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-10', center && 'text-center', className)}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-3 text-base text-muted-foreground sm:text-lg', center && 'mx-auto max-w-2xl')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-gradient shadow-glow">
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; up: boolean };
  index?: number;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, index = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 120, damping: 16 }}
      className={cn('glass-card rounded-2xl p-5', className)}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {trend && (
          <span className={cn(
            'rounded-lg px-2 py-0.5 text-xs font-bold',
            trend.up ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-shine mt-6 rounded-xl bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
