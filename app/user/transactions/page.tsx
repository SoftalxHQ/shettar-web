'use client';

import { Suspense } from 'react';
import UserLayout from '@/app/components/layouts/UserLayout';
import { Transactions } from '@/app/components';

const TransactionsPage = () => {
  return (
    <UserLayout>
      <Suspense fallback={<div className="p-4 text-secondary">Loading transactions…</div>}>
        <Transactions />
      </Suspense>
    </UserLayout>
  );
};

export default TransactionsPage;
