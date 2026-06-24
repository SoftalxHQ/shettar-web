'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  BsDownload,
  BsPerson,
  BsTicketPerforated,
  BsListUl,
  BsStar,
  BsHeart,
  BsFileEarmarkSpreadsheet,
  BsShieldLock,
} from 'react-icons/bs';
import { getStoredToken } from '@/app/helpers/auth';
import { downloadAccountDataExport } from '@/app/helpers/account-data-export';

const INCLUDED_ITEMS = [
  { icon: BsPerson, label: 'Profile', detail: 'Name, email, phone, and account details' },
  { icon: BsTicketPerforated, label: 'Bookings', detail: 'Reservation history and stay details' },
  { icon: BsListUl, label: 'Transactions', detail: 'Wallet credits, debits, and payment records' },
  { icon: BsStar, label: 'Reviews', detail: 'Ratings and comments you have left' },
  { icon: BsHeart, label: 'Wishlist', detail: 'Hotels you saved for later' },
] as const;

const DataExport = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const token = getStoredToken();
    if (!token) {
      toast.error('You are not signed in.');
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading('Preparing your data backup...');
    try {
      const result = await downloadAccountDataExport(token);
      if (result.ok) {
        toast.success(result.message, { id: toastId });
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch {
      toast.error('Failed to download your data.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title">Download Your Data</h4>
      </CardHeader>

      <CardBody>
        <p className="text-secondary mb-4">
          Download a copy of your Shettar account data before deleting your account or for your personal records.
        </p>

        <div className="bg-light rounded-3 p-3 p-md-4 mb-4">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="icon-md bg-primary bg-opacity-10 text-primary rounded-circle flex-centered flex-shrink-0">
              <BsShieldLock size={18} />
            </div>
            <div>
              <h6 className="mb-1">What&apos;s included</h6>
              <p className="small text-secondary mb-0">
                Your backup is exported as a JSON file. Sensitive credentials such as passwords and PINs are never included.
              </p>
            </div>
          </div>

          <Row className="g-3">
            {INCLUDED_ITEMS.map(({ icon: Icon, label, detail }) => (
              <Col md={6} key={label}>
                <div className="d-flex align-items-start">
                  <div className="icon-sm bg-white text-primary rounded-circle me-3 flex-centered flex-shrink-0 shadow-sm">
                    <Icon size={14} />
                  </div>
                  <div>
                    <h6 className="mb-0">{label}</h6>
                    <p className="small text-secondary mb-0">{detail}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div className="d-flex align-items-start gap-3 mb-4">
          <div className="icon-sm bg-light text-primary rounded-circle flex-centered flex-shrink-0">
            <BsFileEarmarkSpreadsheet size={14} />
          </div>
          <div>
            <h6 className="mb-1">Need transactions in Excel?</h6>
            <p className="small text-secondary mb-0">
              Use the Excel export on your{' '}
              <Link href="/user/transactions" className="text-primary">
                Transactions
              </Link>{' '}
              page for spreadsheet-friendly wallet history.
            </p>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            className="mb-0 d-flex align-items-center"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            ) : (
              <BsDownload className="me-2" />
            )}
            {isDownloading ? 'Preparing download...' : 'Download data backup'}
          </Button>
          <Link href="/user/transactions" className="btn btn-primary-soft btn-sm mb-0">
            Export transactions (Excel)
          </Link>
          <Link href="/user/delete-profile" className="btn btn-light btn-sm mb-0">
            Back to delete account
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default DataExport;
