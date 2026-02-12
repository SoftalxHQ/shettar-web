import UserLayout from '@/app/components/layouts/UserLayout';
import { NotificationSettings, SecuritySettings, PersonalInformation, UpdateEmail, UpdatePassword } from '@/app/components';

const SettingsPage = () => {
  return (
    <UserLayout>
      <div className="vstack gap-4">
        <PersonalInformation />
        <UpdateEmail />
        <UpdatePassword />
        <SecuritySettings />
        <NotificationSettings />
      </div>
    </UserLayout>
  );
};

export default SettingsPage;
