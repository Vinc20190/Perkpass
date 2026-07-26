'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { mark: 28, text: 'text-lg' },
  md: { mark: 36, text: 'text-xl' },
  lg: { mark: 48, text: 'text-2xl' },
};

export function Logo({ className, showWordmark = true, variant = 'default', size = 'md' }: LogoProps) {
  const dim = sizeMap[size];
  const wordmarkColor = variant === 'light' ? 'text-white' : 'text-foreground';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <motion.div
        initial={{ rotate: -8, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        whileHover={{ rotate: 4, scale: 1.05 }}
        className="relative grid place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-glow"
        style={{ width: dim.mark, height: dim.mark }}
      >
        <svg
          width={dim.mark * 0.62}
          height={dim.mark * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M5 3.5h8.5a5 5 0 0 1 0 10H9v7H5V3.5Z"
            fill="white"
          />
          <circle cx="17.5" cy="17.5" r="3.2" fill="#F5B301" />
        </svg>
      </motion.div>
      {showWordmark && (
        <span className={cn('font-display font-extrabold tracking-tight', dim.text, wordmarkColor)}>
          Perk<span className="text-primary">Pass</span>
        </span>
      )}
    </div>
  );
}
