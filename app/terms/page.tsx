'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: July 2026</p>
          <div className="prose mt-8 max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
              <p className="mt-2">By accessing or using PerkPass, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">2. Membership</h2>
              <p className="mt-2">PerkPass offers membership plans that provide access to exclusive offers from partner businesses. Memberships are non-transferable and may be cancelled at any time.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">3. Offers and Redemptions</h2>
              <p className="mt-2">Offers are subject to availability and terms set by individual partners. PerkPass is not responsible for the quality of services provided by partners. QR codes are unique per assignment and expire as indicated.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">4. Enterprise Accounts</h2>
              <p className="mt-2">Company accounts are responsible for the actions of their administrators and employees. Budgets, reward catalogs, and assignments are managed per company with role-based access control.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">5. Privacy</h2>
              <p className="mt-2">Your use of PerkPass is also governed by our Privacy Policy, which describes how we collect, use, and protect your data.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">6. Limitation of Liability</h2>
              <p className="mt-2">PerkPass is provided "as is" without warranties of any kind. We are not liable for indirect, incidental, or consequential damages arising from use of the platform.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">7. Contact</h2>
              <p className="mt-2">Questions about these terms? Contact us at legal@perkpass.africa.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
