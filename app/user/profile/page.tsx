'use client';

import UserLayout from '@/app/components/layouts/UserLayout';
import { UserDetails, AccountWallet, ProfileProgress } from '@/app/components';

const ProfilePage = () => {
  return (
    <UserLayout>
      <div className="vstack gap-4">
        <AccountWallet />
        <ProfileProgress />
        <UserDetails />
      </div>
    </UserLayout>
  );
};

export default ProfilePage;
