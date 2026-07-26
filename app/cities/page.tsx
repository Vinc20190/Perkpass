'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CitiesSection } from '@/components/home/cities';

export default function CitiesPage() {
  return (
    <>
      <Header />
      <main>
        <CitiesSection />
      </main>
      <Footer />
    </>
  );
}
