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
  sm: { mark: 32, text: 'text-lg' },
  md: { mark: 40, text: 'text-xl' },
  lg: { mark: 52, text: 'text-2xl' },
};

export function Logo({ className, showWordmark = true, variant = 'default', size = 'md' }: LogoProps) {
  const dim = sizeMap[size];
  const wordmarkColor = variant === 'light' ? 'text-white' : 'text-foreground';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <motion.div
        initial={{ rotate: -6, opacity: 0, scale: 0.9 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        whileHover={{ scale: 1.06 }}
        className="relative shrink-0"
        style={{ width: dim.mark, height: dim.mark }}
      >
        <svg
          width={dim.mark}
          height={dim.mark}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="ppViolet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7B2CBF" />
              <stop offset="100%" stopColor="#5A1E8F" />
            </linearGradient>
            <linearGradient id="ppNeon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C45BFF" />
              <stop offset="100%" stopColor="#FF66C4" />
            </linearGradient>
          </defs>
          {/* Shield */}
          <path
            d="M24 2 L44 9 V24 C44 34 35 42 24 46 C13 42 4 34 4 24 V9 Z"
            fill="url(#ppViolet)"
          />
          {/* Neon shield outline */}
          <path
            d="M24 2 L44 9 V24 C44 34 35 42 24 46 C13 42 4 34 4 24 V9 Z"
            fill="none"
            stroke="url(#ppNeon)"
            strokeWidth="1.5"
            opacity="0.7"
          />
          {/* Interlocking P */}
          <path
            d="M17 14 H26 C30 14 33 16.5 33 21 C33 25.5 30 28 26 28 H21 V34 H17 Z M21 17.5 V24.5 H25.5 C27.5 24.5 29 23 29 21 C29 19 27.5 17.5 25.5 17.5 Z"
            fill="white"
          />
          {/* Pink dot accent */}
          <circle cx="32" cy="33" r="2.5" fill="#FF66C4" />
        </svg>
      </motion.div>
      {showWordmark && (
        <span className={cn('font-display font-extrabold tracking-tight', dim.text, wordmarkColor)}>
          Perk<span className="text-secondary">Pass</span>
        </span>
      )}
    </div>
  );
}
