'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Table, Badge, Button } from 'react-bootstrap';
import { BsDownload } from 'react-icons/bs';
import { currency } from '@/app/states';
import Skeleton from '../Skeleton';
import { getStoredToken, getStoredUser } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';
import Pagination from '../Pagination';
import toast from 'react-hot-toast';

interface Transaction {
  id: number;
  amount: string | number;
  transaction_type: string;
  status: string;
  description: string;
  metadata: any;
  payment_method: string;
  created_at: string;
}

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { apiFetch } = useApi();

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Exporting transactions...');
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await fetch(`${API_URL}/api/v1/export_wallet_transactions`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const user = getStoredUser();
      const firstName = user?.first_name || 'user';
      // Format to mimic ruby Time.current.strftime('%Y-%m-%d-%H%M%S') roughly, or just simple datetime
      const dateStr = new Date().toISOString().replace(/T/, '-').replace(/:/g, '').split('.')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-${firstName.toLowerCase()}-${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Export completed successfully!', { id: toastId });
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const fetchTransactions = async (pageNumber: number) => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/api/v1/wallet_transactions?page=${pageNumber}&limit=10`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

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
    <Card className="border shadow-sm">
      <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
        <h4 className="card-header-title mb-0">Transaction History</h4>
        <Button
          variant="primary"
          size="sm"
          className="mb-0 d-flex align-items-center"
          onClick={handleExport}
          disabled={isExporting || transactions.length === 0}
        >
          {isExporting ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          ) : (
            <BsDownload className="me-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </CardHeader>

      <CardBody className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3">Method</th>
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
                    <td><Skeleton height="20px" width="70px" /></td>
                    <td><Skeleton height="20px" width="80px" /></td>
                    <td><Skeleton height="20px" width="120px" /></td>
                    <td className="text-end"><Skeleton height="20px" width="80px" className="ms-auto" /></td>
                    <td className="text-center px-4"><Skeleton height="24px" width="70px" className="mx-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
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
                        {txn.payment_method ? (
                          <Badge bg="light" className="text-secondary border text-capitalize fw-normal">
                            {txn.payment_method}
                          </Badge>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
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
      {pagination && pagination.last > 1 && (
        <div className="card-footer border-top bg-transparent">
          <Pagination
            currentPage={page}
            totalPages={pagination.last}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </Card>
  );
};

export default Transactions;

