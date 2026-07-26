'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">Cookie Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: July 2026</p>
          <div className="prose mt-8 max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">1. What Are Cookies</h2>
              <p className="mt-2">Cookies are small text files stored on your device when you visit PerkPass. They help us authenticate your session, remember preferences, and analyze platform usage.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">2. Types of Cookies We Use</h2>
              <p className="mt-2">Essential cookies for authentication and security, preference cookies for language and currency settings, and analytics cookies to understand usage patterns. We do not use advertising cookies.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">3. Managing Cookies</h2>
              <p className="mt-2">You can control cookies through your browser settings. Disabling essential cookies may affect functionality such as login and session persistence.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">4. Contact</h2>
              <p className="mt-2">Questions about cookies? Contact us at privacy@perkpass.africa.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
