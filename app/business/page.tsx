'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CorporateSection } from '@/components/home/corporate';
import { PricingSection } from '@/components/home/pricing';

export default function BusinessPage() {
  return (
    <>
      <Header />
      <main>
        <CorporateSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
