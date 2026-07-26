export type LocaleCode =
  | 'en' | 'fr' | 'ar' | 'pt' | 'sw' | 'es' | 'de' | 'it' | 'tr' | 'nl';

export interface LocaleMeta {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  flag: string;
  rtl: boolean;
}

export const LOCALES: LocaleMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: 'GB', rtl: false },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: 'FR', rtl: false },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: 'SA', rtl: true },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: 'PT', rtl: false },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', flag: 'KE', rtl: false },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: 'ES', rtl: false },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: 'DE', rtl: false },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: 'IT', rtl: false },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', flag: 'TR', rtl: false },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flag: 'NL', rtl: false },
];

export function isRtl(code: LocaleCode): boolean {
  return LOCALES.find((l) => l.code === code)?.rtl ?? false;
}

export function getLocaleMeta(code: LocaleCode): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}
