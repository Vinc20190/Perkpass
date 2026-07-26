'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PricingSection } from '@/components/home/pricing';

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
