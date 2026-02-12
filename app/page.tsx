import TopNavBar4 from './components/TopNavBar4';
import Hero from './components/Hero';
import HotelListFilter from './components/HotelListFilter';
import HotelGridLayout from './components/HotelGridLayout';
import Footer from './components/Footer';

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
