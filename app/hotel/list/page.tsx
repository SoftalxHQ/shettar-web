import { Header, Hero, HotelListFilter, HotelLists, Footer } from '@/app/components';

export default function HotelListPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HotelLists />
      </main>
      <Footer />
    </>
  );
}
