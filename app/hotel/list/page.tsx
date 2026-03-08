import { Suspense } from 'react';
import { Header, Hero, HotelListFilter, HotelLists, Footer } from '@/app/components';

export default function HotelListPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Hero />
        </Suspense>
        <Suspense fallback={<div>Loading hotels...</div>}>
          <HotelLists />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
