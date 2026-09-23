import type { Metadata } from 'next';
import { Header, Footer } from '@/app/components';
import HomePageMain from '@/app/components/HomePageMain';

const SITE_HOME = 'https://www.shettar.com';

export const metadata: Metadata = {
  alternates: { canonical: SITE_HOME },
  openGraph: {
    url: SITE_HOME,
    siteName: 'Shettar',
  },
};

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
