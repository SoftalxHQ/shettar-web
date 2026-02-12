'use client';

import UserLayout from '@/app/components/layouts/UserLayout';
import PersonalInformation from '@/app/components/Profile/PersonalInformation';
import ProfileProgress from '@/app/components/Profile/ProfileProgress';
import UpdateEmail from '@/app/components/Profile/UpdateEmail';
import UpdatePassword from '@/app/components/Profile/UpdatePassword';

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
