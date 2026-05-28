import { Suspense } from 'react';
import { Header, Hero, HotelGridFilter, FeaturedHotels, HotelGridLayout, Footer } from '@/app/components';

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Hero />
        </Suspense>
        <Suspense fallback={<div>Loading filters...</div>}>
          <HotelGridFilter />
        </Suspense>
        <Suspense fallback={<div>Loading featured hotels...</div>}>
          <FeaturedHotels />
        </Suspense>
        <Suspense fallback={<div>Loading hotels...</div>}>
          <HotelGridLayout />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
