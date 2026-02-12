import { TopNavBar4, Hero, HotelListFilter, HotelGridLayout, Footer } from '@/app/components';

export default function Home() {
  return (
    <>
      <TopNavBar4 />

      <main>
        <Hero />
        <HotelListFilter />
        <HotelGridLayout />
      </main>

      <Footer />
    </>
  );
}
