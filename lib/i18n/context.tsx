'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LocaleCode } from './locales';
import { isRtl, getLocaleMeta, LOCALES } from './locales';
import { getDictionary, type Dictionary } from './dictionary';
import { fetchExchangeRates, getStoredCurrency, setStoredCurrency } from './currencies';

interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: keyof Dictionary) => string;
  rtl: boolean;
  dictionary: Dictionary;
  currency: string;
  setCurrency: (code: string) => void;
  rates: Record<string, number>;
  formatPrice: (usd: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = 'perkpass_locale';

function detectLocale(): LocaleCode {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode | null;
  if (stored && LOCALES.some((l) => l.code === stored)) return stored;
  const browser = navigator.language.slice(0, 2) as LocaleCode;
  if (LOCALES.some((l) => l.code === browser)) return browser;
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en');
  const [currency, setCurrencyState] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setCurrencyState(getStoredCurrency());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchExchangeRates().then(setRates);
  }, [mounted]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    if (typeof window !== 'undefined') localStorage.setItem(LOCALE_STORAGE_KEY, code);
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    setStoredCurrency(code);
  }, []);

  const rtl = isRtl(locale);
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const t = useCallback(
    (key: keyof Dictionary) => dictionary[key] ?? (getDictionary('en')[key] as string) ?? (key as string),
    [dictionary]
  );

  const formatPrice = useCallback(
    (usd: number) => {
      const rate = rates[currency] ?? 1;
      const converted = usd * rate;
      const meta = { USD: '$', NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', EGP: 'E£', MAD: 'DH', UGX: 'USh', RWF: 'FRw', XOF: 'CFA', XAF: 'FCFA', ETB: 'Br', TZS: 'TSh', AOA: 'Kz', DZD: 'DA', TND: 'DT' };
      const symbol = meta[currency as keyof typeof meta] ?? '$';
      const fractionDigits = converted >= 100 ? 0 : 2;
      return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
    },
    [rates, currency]
  );

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [locale, rtl, mounted]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, rtl, dictionary, currency, setCurrency, rates, formatPrice }),
    [locale, setLocale, t, rtl, dictionary, currency, setCurrency, rates, formatPrice]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { LOCALES, getLocaleMeta };
