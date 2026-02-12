'use client';

import { Card, CardBody, CardHeader, Table, Badge } from 'react-bootstrap';
import { transactionData } from '@/app/data/transactions';
import { currency } from '@/app/states';

const Transactions = () => {
  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title text-dark mb-0">Transactions</h4>
      </CardHeader>

      <CardBody className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-dark py-3">Type</th>
                <th className="text-dark py-3">Date</th>
                <th className="text-dark py-3">Amount</th>
                <th className="text-dark py-3">Status</th>
                <th className="text-dark py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.map((txn, idx) => (
                <tr key={idx}>
                  <td className="text-dark">{txn.type}</td>
                  <td className="text-dark small">{txn.date}</td>
                  <td className="text-dark fw-bold">
                    {currency}{txn.amount.toLocaleString()}
                  </td>
                  <td>
                    <Badge
                      bg={txn.status === 'Success' ? 'success' : txn.status === 'Pending' ? 'warning' : 'danger'}
                      className="bg-opacity-10 text-capitalize"
                      style={{ color: txn.status === 'Success' ? '#198754' : txn.status === 'Pending' ? '#ffc107' : '#dc3545' }}
                    >
                      {txn.status}
                    </Badge>
                  </td>
                  <td className="text-secondary small">{txn.reference}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default Transactions;
