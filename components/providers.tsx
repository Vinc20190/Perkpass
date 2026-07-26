'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n/context';
import { AuthProvider } from '@/lib/auth/context';
import { CompanyProvider } from '@/lib/company/context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <AuthProvider>
          <CompanyProvider>{children}</CompanyProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
