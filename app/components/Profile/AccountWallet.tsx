'use client';

import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { BsWallet2, BsBank, BsCopy } from 'react-icons/bs';
import { currency } from '@/app/states';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';

const AccountWallet = () => {
  const { account: profile, isAccountLoading: isLoading } = useLayoutContext();

  const balance = profile?.wallet_balance != null
    ? Number(profile.wallet_balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Row className="g-4">
      <Col md={6}>
        <Card className="bg-primary bg-opacity-10 border border-primary border-opacity-25 h-100">
          <CardBody className="p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="icon-md bg-primary text-white rounded-circle me-3 flex-centered">
                <BsWallet2 size={20} />
              </div>
              <h5 className="mb-0">Wallet Balance</h5>
            </div>

            {isLoading ? (
              <div className="placeholder-glow">
                <span className="placeholder col-5 d-block mb-2" style={{ height: 36 }} />
                <span className="placeholder col-4 d-block mb-4" />
              </div>
            ) : (
              <>
                <h2 className="mb-1">{currency}{balance}</h2>
                <p className="small mb-4 opacity-75">Available balance</p>
              </>
            )}

            <div className="d-flex gap-2">
              <Link href="/user/transactions" className="btn btn-sm btn-primary mb-0 flex-centered">Top Up</Link>
              <Link href="/user/transactions" className="btn btn-sm btn-outline-primary mb-0 flex-centered">History</Link>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col md={6}>
        <Card className="bg-light border h-100">
          <CardBody className="p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="icon-md bg-dark text-white rounded-circle me-3 flex-centered">
                <BsBank size={20} />
              </div>
              <h5 className="mb-0">Virtual Account</h5>
            </div>

            <div className="bg-mode p-3 rounded border mb-3">
              <p className="small mb-1">Account Number</p>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">0012 3456 7890</h5>
                <Button variant="link" className="p-0 text-primary" onClick={() => copyToClipboard('001234567890')}>
                  <BsCopy size={16} />
                </Button>
              </div>
            </div>

            <div className="row g-2">
              <Col xs={6}>
                <p className="small mb-1">Bank Name</p>
                <h6>Abri Global Bank</h6>
              </Col>
              <Col xs={6}>
                <p className="small mb-1">Account Holder</p>
                <h6 className="text-truncate">{isLoading ? <span className="placeholder col-8" /> : (fullName || '—')}</h6>
              </Col>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AccountWallet;
