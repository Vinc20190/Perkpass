'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CountriesSection } from '@/components/home/countries';

export default function CountriesPage() {
  return (
    <>
      <Header />
      <main>
        <CountriesSection />
      </main>
      <Footer />
    </>
  );
}
