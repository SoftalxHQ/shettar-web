'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Hero from '@/app/components/About/Hero';
import OurStory from '@/app/components/About/OurStory';
import WhyShettar from '@/app/components/About/WhyShettar';

const AboutPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <OurStory />
        <WhyShettar />
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
