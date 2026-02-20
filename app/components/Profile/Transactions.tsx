'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Table, Badge } from 'react-bootstrap';
import { currency } from '@/app/states';
import Skeleton from '../Skeleton';
import { getStoredToken } from '@/app/helpers/auth';

interface Transaction {
  id: number;
  amount: string | number;
  transaction_type: string;
  status: string;
  description: string;
  metadata: any;
  created_at: string;
}

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = getStoredToken();
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        const response = await fetch(`${API_URL}/api/v1/wallet_transactions`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'success') return { bg: 'success', color: '#198754', text: 'Completed' };
    if (s === 'pending') return { bg: 'warning', color: '#ffc107', text: 'Pending' };
    if (s === 'failed') return { bg: 'danger', color: '#dc3545', text: 'Failed' };
    return { bg: 'secondary', color: '#6c757d', text: status };
  };

  const getAmountStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'income' || t === 'refund') return 'text-success';
    if (t === 'withdrawal' || t === 'debit' || t === 'payment') return 'text-danger';
    return '';
  };

  const formatAmount = (txn: Transaction) => {
    const amount = Number(txn.amount);
    const t = txn.transaction_type.toLowerCase();
    const isPositive = t === 'income' || t === 'refund';
    const prefix = isPositive ? '+' : '-';
    return `${prefix}${currency}${amount.toLocaleString()}`;
  };

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title mb-0">Transaction History</h4>
      </CardHeader>

      <CardBody className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3">Type</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-end">Amount</th>
                <th className="py-3 text-center px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4"><Skeleton height="20px" width="200px" /></td>
                    <td><Skeleton height="20px" width="80px" /></td>
                    <td><Skeleton height="20px" width="120px" /></td>
                    <td className="text-end"><Skeleton height="20px" width="80px" className="ms-auto" /></td>
                    <td className="text-center px-4"><Skeleton height="24px" width="70px" className="mx-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="opacity-50 mb-2 h5">No history yet</div>
                    <p className="small text-secondary mb-0">Your financial activities will appear here.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const status = getStatusBadge(txn.status);
                  return (
                    <tr key={txn.id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">{txn.description}</div>
                      </td>
                      <td>
                        <span className="text-capitalize small fw-bold text-secondary">
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(txn.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className={`fw-bold text-end ${getAmountStyle(txn.transaction_type)}`}>
                        {formatAmount(txn)}
                      </td>
                      <td className="text-center px-4">
                        <Badge
                          bg={status.bg}
                          className="bg-opacity-10 text-capitalize"
                          style={{ color: status.color }}
                        >
                          {status.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default Transactions;

