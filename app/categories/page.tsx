'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CategoriesSection } from '@/components/home/categories';
import { FeaturedOffers } from '@/components/home/featured-offers';

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main>
        <CategoriesSection />
        <FeaturedOffers />
      </main>
      <Footer />
    </>
  );
}
