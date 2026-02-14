import { TopNavBar4, Hero, HotelGridFilter, HotelGridLayout, Footer } from '@/app/components';

export default function HotelGridPage() {
  return (
    <>
      <TopNavBar4 />
      <main>
        <Hero />
        <HotelGridFilter />
        <HotelGridLayout />
      </main>
      <Footer />
    </>
  );
}
