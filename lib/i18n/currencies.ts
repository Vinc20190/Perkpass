export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<string, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  MAD: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  RWF: { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'West African CFA' },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA' },
  ETB: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  AOA: { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  DZD: { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
  TND: { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar' },
};

const STORAGE_KEY = 'perkpass_currency';
let rateCache: Record<string, number> | null = null;

export function getStoredCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  return localStorage.getItem(STORAGE_KEY) || 'USD';
}

export function setStoredCurrency(code: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, code);
}

export function formatCurrency(
  amountUsd: number,
  currencyCode: string = 'USD',
  rates?: Record<string, number>
): string {
  const rate = rates?.[currencyCode] ?? 1;
  const converted = amountUsd * rate;
  const meta = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  const fractionDigits = converted >= 100 ? 0 : 2;
  return `${meta.symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  if (rateCache) return rateCache;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/exchange_rates?select=currency_code,rate_to_usd`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch rates');
    const rows: { currency_code: string; rate_to_usd: string }[] = await res.json();
    rateCache = {};
    for (const r of rows) rateCache[r.currency_code] = Number(r.rate_to_usd);
    return rateCache;
  } catch {
    return { USD: 1 };
  }
}
