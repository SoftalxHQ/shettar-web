import { TopNavBar4, Hero, HotelListFilter, HotelLists, Footer } from '@/app/components';

export default function HotelListPage() {
  return (
    <>
      <TopNavBar4 />
      <main>
        <Hero />
        <HotelLists />
      </main>
      <Footer />
    </>
  );
}
