export type TransactionType = {
  id: string;
  type: 'Wallet Top-up' | 'Data Purchase' | 'Airtime Purchase' | 'Hotel Booking' | 'Flight Booking';
  amount: number;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
};

export const transactionData: TransactionType[] = [
  {
    id: 'TXN1001',
    type: 'Wallet Top-up',
    amount: 50000,
    date: 'Jun 24, 2026',
    status: 'Success',
    reference: 'REF-8822910',
  },
  {
    id: 'TXN1002',
    type: 'Hotel Booking',
    amount: 12500,
    date: 'Jun 20, 2026',
    status: 'Success',
    reference: 'BK-99201',
  },
  {
    id: 'TXN1003',
    type: 'Airtime Purchase',
    amount: 2000,
    date: 'Jun 18, 2026',
    status: 'Success',
    reference: 'MTN-77281',
  },
  {
    id: 'TXN1004',
    type: 'Data Purchase',
    amount: 5000,
    date: 'Jun 15, 2026',
    status: 'Success',
    reference: 'GLO-22109',
  },
  {
    id: 'TXN1005',
    type: 'Wallet Top-up',
    amount: 10000,
    date: 'Jun 10, 2026',
    status: 'Failed',
    reference: 'REF-112093',
  },
];
