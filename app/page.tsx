'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { PartnersStrip } from '@/components/home/partners-strip';
import { CategoriesSection } from '@/components/home/categories';
import { FeaturedOffers } from '@/components/home/featured-offers';
import { CitiesSection } from '@/components/home/cities';
import { CorporateSection } from '@/components/home/corporate';
import { CountriesSection } from '@/components/home/countries';
import { PricingSection } from '@/components/home/pricing';
import { TestimonialsSection } from '@/components/home/testimonials';
import { AppDownloadSection } from '@/components/home/app-download';
import { FAQSection } from '@/components/home/faq';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PartnersStrip />
        <CategoriesSection />
        <FeaturedOffers />
        <CitiesSection />
        <CorporateSection />
        <CountriesSection />
        <PricingSection />
        <TestimonialsSection />
        <AppDownloadSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
