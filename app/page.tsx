import { Header, Footer } from '@/app/components';
import HomePageMain from '@/app/components/HomePageMain';

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <HomePageMain />
      </main>

      <Footer />
    </>
  );
}
