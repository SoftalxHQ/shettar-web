'use client';

import TopNavBar4 from '@/app/components/TopNavBar4';
import RoomGallery from '@/app/components/RoomDetails/RoomGallery';
import RoomSelection from '@/app/components/RoomDetails/RoomSelection';
import Footer from '@/app/components/Footer';

export default function RoomDetailsPage() {
  return (
    <>
      <TopNavBar4 />
      <main>
        <RoomGallery />
        <RoomSelection />
      </main>
      <Footer />
    </>
  );
}
