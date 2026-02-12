'use client';

import UserLayout from '@/app/components/layouts/UserLayout';
import { NotificationSettings, SecuritySettings } from '@/app/components';

const SettingsPage = () => {
  return (
    <UserLayout>
      <div className="vstack gap-4">
        <NotificationSettings />
        <SecuritySettings />
      </div>
    </UserLayout>
  );
};

export default SettingsPage;
