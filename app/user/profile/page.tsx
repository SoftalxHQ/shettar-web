'use client';

import UserLayout from '@/app/components/layouts/UserLayout';
import { PersonalInformation, ProfileProgress, UpdateEmail, UpdatePassword } from '@/app/components';

const ProfilePage = () => {
  return (
    <UserLayout>
      <div className="vstack gap-4">
        <ProfileProgress />
        <PersonalInformation />
        <UpdateEmail />
        <UpdatePassword />
      </div>
    </UserLayout>
  );
};

export default ProfilePage;
