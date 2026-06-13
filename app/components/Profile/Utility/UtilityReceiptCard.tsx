'use client';

import { useRef } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { BsDownload, BsPhone, BsPrinter, BsWallet2, BsWifi } from 'react-icons/bs';
import { useReactToPrint } from 'react-to-print';
import { currency } from '@/app/states';

export type UtilityReceipt = {
  type: string;
  amount: string;
  recipient: string;
  network: string;
  plan?: string;
  status: 'delivered' | 'pending';
  requestId?: string;
  purchasedAt: string;
};

type UtilityReceiptCardProps = {
  receipt: UtilityReceipt;
};

const UtilityReceiptCard = ({ receipt }: UtilityReceiptCardProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: componentRef });

  const isPending = receipt.status === 'pending';
  const isData = receipt.type.toLowerCase().includes('data');

  const formattedAmount = receipt.amount.startsWith(currency) || receipt.amount.startsWith('₦')
    ? receipt.amount
    : `${currency}${Number(receipt.amount).toLocaleString('en-NG')}`;

  const displayReference = receipt.requestId || `UTL-${receipt.purchasedAt.slice(-8)}`;
  const purchaseDate = new Date(receipt.purchasedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const purchaseTime = new Date(receipt.purchasedAt).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="utility-receipt print-card" ref={componentRef}>
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-body">
        <div className="bg-primary bg-gradient p-4 text-white">
          <Row className="align-items-center">
            <Col>
              <span className="text-white-50 small text-uppercase fw-bold ls-1">Transaction Reference</span>
              <h3 className="mb-0 text-white font-monospace">{displayReference}</h3>
            </Col>
            <Col xs="auto" className="d-flex gap-2 no-print">
              <Button
                variant="white"
                size="sm"
                className="btn-light-soft bg-white bg-opacity-25 border-0 text-white rounded-circle p-2 flex-centered"
                title="Print Receipt"
                style={{ width: '40px', height: '40px' }}
                onClick={() => handlePrint()}
              >
                <BsPrinter size={18} />
              </Button>
              <Button
                variant="white"
                size="sm"
                className="btn-light-soft bg-white bg-opacity-25 border-0 text-white rounded-circle p-2 flex-centered"
                title="Download PDF"
                style={{ width: '40px', height: '40px' }}
                onClick={() => handlePrint()}
              >
                <BsDownload size={18} />
              </Button>
            </Col>
          </Row>
        </div>

        <Card.Body className="p-4 p-md-5">
          <div className="d-flex align-items-center mb-4 mb-md-5">
            <div className="flex-shrink-0">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary flex-centered">
                {isData ? <BsWifi size={32} /> : <BsPhone size={32} />}
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h4 className="mb-1 text-body-emphasis fw-bold">{receipt.type}</h4>
              <p className="mb-0 text-body-secondary small">
                {receipt.network ? `${receipt.network} · ` : ''}Shettar Utility Services
              </p>
            </div>
          </div>

          <div className="bg-body-tertiary p-4 rounded-4 mb-4 mb-md-5 border-start border-primary border-4 shadow-sm">
            <Row className="g-4 text-center text-md-start">
              <Col xs={6} md={4}>
                <h6 className="text-uppercase small fw-bold text-primary mb-2" style={{ letterSpacing: '0.5px' }}>
                  Recipient
                </h6>
                <p className="h6 mb-1 text-body fw-bold">{receipt.recipient || '—'}</p>
                <small className="text-primary fw-bold text-uppercase">Phone Number</small>
              </Col>
              <Col xs={6} md={4}>
                <h6 className="text-uppercase small fw-bold text-primary mb-2" style={{ letterSpacing: '0.5px' }}>
                  Network
                </h6>
                <p className="h6 mb-1 text-body fw-bold">{receipt.network || '—'}</p>
                <small className="text-primary fw-bold text-uppercase">Provider</small>
              </Col>
              <Col xs={12} md={4}>
                <h6 className="text-uppercase small fw-bold text-primary mb-2" style={{ letterSpacing: '0.5px' }}>
                  Date
                </h6>
                <p className="h6 mb-1 text-body fw-bold">{purchaseDate}</p>
                <small className="text-primary fw-bold text-uppercase">{purchaseTime}</small>
              </Col>
            </Row>
          </div>

          <div className="mb-4 mb-md-5">
            <h6
              className="text-uppercase small text-body-secondary mb-3 border-bottom pb-2 fw-bold"
              style={{ letterSpacing: '1px' }}
            >
              Purchase Summary
            </h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-body-emphasis">Service Type</span>
              <span className="text-body fw-semibold small">{receipt.type}</span>
            </div>
            {receipt.plan ? (
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-body-secondary fw-medium small">Data Plan</span>
                <span className="text-body fw-semibold small text-end" style={{ maxWidth: '55%' }}>
                  {receipt.plan}
                </span>
              </div>
            ) : null}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-body-secondary fw-medium small">Status</span>
              <span className={`badge ${isPending ? 'bg-warning text-dark' : 'bg-success'} px-3 py-2`}>
                {isPending ? 'Processing' : 'Delivered'}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-body-secondary fw-medium small">Payment Method</span>
              <span className="text-body fw-semibold small d-flex align-items-center gap-1">
                <BsWallet2 />
                Shettar Wallet
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
              <h5 className="mb-0 text-body-emphasis fw-bold">Total Amount Paid</h5>
              <h4 className="mb-0 text-primary fw-bold">{formattedAmount}</h4>
            </div>
            <p className="text-end small text-body-secondary mt-2 mb-0 font-italic">Paid via Shettar Wallet</p>
          </div>

          <div className="mb-0">
            <h6 className="text-uppercase small text-body-secondary mb-3 fw-bold">What you purchased</h6>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-body-secondary text-body-emphasis border border-secondary border-opacity-25 px-3 py-2 fw-medium shadow-sm">
                {receipt.network || 'Network'}
              </span>
              <span className="badge bg-body-secondary text-body-emphasis border border-secondary border-opacity-25 px-3 py-2 fw-medium shadow-sm">
                {isData ? 'Data Bundle' : 'Airtime VTU'}
              </span>
              {receipt.plan ? (
                <span className="badge bg-body-secondary text-body-emphasis border border-secondary border-opacity-25 px-3 py-2 fw-medium shadow-sm">
                  {receipt.plan}
                </span>
              ) : null}
            </div>
          </div>
        </Card.Body>

        <div
          className="perforated-edge d-flex w-100 px-3 overflow-hidden"
          style={{ marginTop: '-12px', marginBottom: '-12px', gap: '8px' }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="perforated-hole rounded-circle flex-shrink-0"
              style={{ width: '20px', height: '20px', border: '1px solid rgba(0,0,0,0.05)' }}
            />
          ))}
        </div>
      </Card>

      <style jsx>{`
        .ls-1 {
          letter-spacing: 1px;
        }
        .flex-centered {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .perforated-hole {
          background-color: var(--bs-body-tertiary);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        @media print {
          @page {
            margin: 0.5cm;
            size: auto;
          }
          body * {
            visibility: hidden !important;
          }
          .print-card,
          .print-card * {
            visibility: visible !important;
          }
          .print-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          .card {
            border: 1px solid #eee !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-primary {
            background-color: #4f46e5 !important;
            background-image: linear-gradient(to bottom right, #4f46e5, #4338ca) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .perforated-edge {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UtilityReceiptCard;
