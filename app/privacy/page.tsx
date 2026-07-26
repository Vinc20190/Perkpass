'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: July 2026</p>
          <div className="prose mt-8 max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">1. Information We Collect</h2>
              <p className="mt-2">We collect account information (name, email), usage data (offers viewed, rewards redeemed), and device information for security purposes. Company accounts include employee data managed by authorized administrators.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">2. How We Use Your Data</h2>
              <p className="mt-2">Your data is used to provide membership services, personalize offers, process reward assignments, generate analytics, and communicate important updates. We never sell your personal data.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">3. Data Security</h2>
              <p className="mt-2">We use Row Level Security, encrypted connections, JWT-based authentication, and regular security audits. Company data is isolated per tenant — no cross-tenant access is possible.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">4. Your Rights</h2>
              <p className="mt-2">You can access, correct, or delete your personal data from your account settings. You may also request data export at any time by contacting privacy@perkpass.africa.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">5. Data Retention</h2>
              <p className="mt-2">We retain your data while your account is active. Upon deletion, we remove personal data within 30 days, except where retention is required by law.</p>
            </section>
            <section>
              <h2 className="font-display text-xl font-bold text-foreground">6. Contact</h2>
              <p className="mt-2">Questions about privacy? Contact us at privacy@perkpass.africa.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
