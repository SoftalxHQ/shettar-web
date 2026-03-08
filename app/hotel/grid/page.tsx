import { Suspense } from 'react';
import { Header, Hero, HotelGridFilter, HotelGridLayout, Footer } from '@/app/components';

export default function HotelGridPage() {
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
        <Suspense fallback={<div>Loading hotels...</div>}>
          <HotelGridLayout />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
