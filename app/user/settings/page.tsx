import UserLayout from '@/app/components/layouts/UserLayout';
import { NotificationSettings, SecuritySettings, PersonalInformation, UpdatePassword } from '@/app/components';

const SettingsPage = () => {
  return (
    <UserLayout>
      <div className="vstack gap-4">
        <PersonalInformation />
        <UpdatePassword />
        <SecuritySettings />
        {/* <NotificationSettings /> */}
      </div>
    </UserLayout>
  );
};

export default SettingsPage;
