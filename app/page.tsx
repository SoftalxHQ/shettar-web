import { Header, Hero, HotelGridFilter, HotelGridLayout, Footer } from '@/app/components';

export default function Home() {
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
