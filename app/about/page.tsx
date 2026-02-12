'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Hero from '@/app/components/About/Hero';
import OurStory from '@/app/components/About/OurStory';
import OurTeam from '@/app/components/About/OurTeam';

const AboutPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <OurStory />
        <OurTeam />
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
