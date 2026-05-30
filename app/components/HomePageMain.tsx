'use client';

import { HomeSearchProvider } from '@/app/contexts/HomeSearchContext';
import { Suspense } from 'react';
import { Hero, HotelGridFilter, FeaturedHotels, HotelGridLayout } from '@/app/components';
import HomeNotificationPrompt from '@/app/components/HomeNotificationPrompt';

function HomePageContent() {
  return (
    <HomeSearchProvider>
      <Hero />
      <HomeNotificationPrompt />
      <HotelGridFilter />
      <FeaturedHotels />
      <HotelGridLayout />
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
