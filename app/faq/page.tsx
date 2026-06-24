'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Hero from '@/app/components/FAQ/Hero';
import AllFAQs from '@/app/components/FAQ/AllFAQs';
import ActionBox from '@/app/components/FAQ/ActionBox';
import SupportChatCallout from '@/app/components/FAQ/SupportChatCallout';

const FAQPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AllFAQs />
        <SupportChatCallout />
        <ActionBox />
      </main>
      <Footer />
    </>
  );
};

export default FAQPage;
