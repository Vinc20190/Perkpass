import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCents(cents: number, currencyCode: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$', NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', EGP: 'E£',
    MAD: 'DH', UGX: 'USh', RWF: 'FRw', XOF: 'CFA', XAF: 'FCFA',
    ETB: 'Br', TZS: 'TSh', AOA: 'Kz', DZD: 'DA', TND: 'DT',
  };
  const symbol = symbols[currencyCode] ?? '$';
  const value = cents / 100;
  const fractionDigits = value >= 100 ? 0 : 2;
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function generateShortCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
