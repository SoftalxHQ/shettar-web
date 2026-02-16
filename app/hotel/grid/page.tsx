import { Header, Hero, HotelGridFilter, HotelGridLayout, Footer } from '@/app/components';

export default function HotelGridPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HotelGridFilter />
        <HotelGridLayout />
      </main>
      <Footer />
    </>
  );
}
