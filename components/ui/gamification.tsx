'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Award, Zap, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeLevel {
  id: string;
  name: string;
  description: string;
  icon: 'crown' | 'star' | 'award' | 'zap' | 'trending' | 'shield';
  color: string;
  earned: boolean;
  progress?: number;
}

const iconMap = {
  crown: Crown,
  star: Star,
  award: Award,
  zap: Zap,
  trending: TrendingUp,
  shield: Shield,
};

const colorMap: Record<string, string> = {
  gold: 'from-amber-400 to-yellow-500',
  silver: 'from-slate-300 to-slate-400',
  bronze: 'from-orange-400 to-orange-600',
  pink: 'from-pink-400 to-rose-500',
  violet: 'from-violet-500 to-purple-600',
  green: 'from-emerald-400 to-teal-500',
};

export function BadgeCard({ badge, index = 0 }: { badge: BadgeLevel; index?: number }) {
  const Icon = iconMap[badge.icon] ?? Star;
  const gradient = colorMap[badge.color] ?? colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 16 }}
      className={cn(
        'relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all',
        badge.earned
          ? 'border-primary/20 bg-card shadow-glow'
          : 'border-border bg-muted/50 opacity-70 grayscale'
      )}
    >
      {badge.earned && (
        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-success ring-4 ring-card" />
      )}
      <div className={cn('grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br shadow-lg', gradient)}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div>
        <p className="font-display text-sm font-bold">{badge.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
      </div>
      {!badge.earned && badge.progress !== undefined && (
        <div className="w-full">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary-gradient transition-all duration-500"
              style={{ width: `${badge.progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{badge.progress}%</p>
        </div>
      )}
    </motion.div>
  );
}

export function BadgeGrid({ badges }: { badges: BadgeLevel[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {badges.map((badge, i) => (
        <BadgeCard key={badge.id} badge={badge} index={i} />
      ))}
    </div>
  );
}

export function PointsDisplay({
  points,
  level,
  nextLevelPoints,
  label = 'Points',
}: {
  points: number;
  level: string;
  nextLevelPoints: number;
  label?: string;
}) {
  const progress = Math.min(100, (points / nextLevelPoints) * 100);

  return (
    <div className="glass-card flex items-center gap-4 rounded-2xl p-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary-gradient shadow-glow">
        <Zap className="h-7 w-7 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-2xl font-extrabold">{points.toLocaleString()}</span>
          <span className="text-sm font-bold text-primary">{level}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary-gradient transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {label} • {nextLevelPoints - points} to next level
        </p>
      </div>
    </div>
  );
}

export function LevelBadge({ level, className }: { level: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-primary-gradient px-3 py-1 text-xs font-bold text-white shadow-glow',
        className
      )}
    >
      <Crown className="h-3.5 w-3.5" />
      {level}
    </span>
  );
}
