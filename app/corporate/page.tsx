'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CorporateSection } from '@/components/home/corporate';

export default function CorporatePage() {
  return (
    <>
      <Header />
      <main>
        <CorporateSection />
      </main>
      <Footer />
    </>
  );
}
