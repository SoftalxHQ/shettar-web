import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { BsWallet2, BsBank, BsCopy } from 'react-icons/bs';
import { currency } from '@/app/states';
import Link from 'next/link';

const AccountWallet = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
            <h2 className="mb-2">
              {currency}12,500.00
            </h2>
            <p className="small mb-4">Last update: June 25, 2026</p>
            <div className="d-flex gap-2">
              <Link href="/user/transactions" className="btn btn-sm btn-primary mb-0 flex-centered">Top Up</Link>
              <Link href="/user/transactions" className="btn btn-sm btn-outline-primary mb-0 flex-centered">Transaction History</Link>
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
                <h6 className="text-truncate">Jacqueline Miller</h6>
              </Col>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AccountWallet;
