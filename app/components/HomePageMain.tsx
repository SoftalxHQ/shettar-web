'use client';

import { HomeSearchProvider } from '@/app/contexts/HomeSearchContext';
import { Suspense } from 'react';
import { Hero, HotelGridFilter, FeaturedHotels, HotelGridLayout } from '@/app/components';
import HomeTurnstileGate from '@/app/components/HomeTurnstileGate';
import HomeNotificationPrompt from '@/app/components/HomeNotificationPrompt';
import HomeLocationPrompt from '@/app/components/HomeLocationPrompt';

function HomePageContent() {
  return (
    <HomeSearchProvider>
      <HomeTurnstileGate>
        <Hero />
        <HomeLocationPrompt />
        <HomeNotificationPrompt />
        <HotelGridFilter />
        <FeaturedHotels />
        <HotelGridLayout />
      </HomeTurnstileGate>
    </HomeSearchProvider>
  );
}

export default function HomePageMain() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
