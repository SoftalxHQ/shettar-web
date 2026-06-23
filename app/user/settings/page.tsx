import UserLayout from '@/app/components/layouts/UserLayout';
import { NotificationSettings, SecuritySettings, PersonalInformation, UpdatePassword, TransactionPinSettings } from '@/app/components';

const SettingsPage = () => {
  return (
    <UserLayout>
      <div className="vstack gap-4">
        <PersonalInformation />
        <UpdatePassword />
        <SecuritySettings />
        <TransactionPinSettings />
        <NotificationSettings />
      </div>
    </UserLayout>
  );
};

export default SettingsPage;
