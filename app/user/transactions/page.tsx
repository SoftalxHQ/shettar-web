'use client';

import UserLayout from '@/app/components/layouts/UserLayout';
import { Transactions } from '@/app/components';

const TransactionsPage = () => {
  return (
    <UserLayout>
      <Transactions />
    </UserLayout>
  );
};

export default TransactionsPage;
