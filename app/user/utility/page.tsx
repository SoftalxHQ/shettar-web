'use client';

import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import UserLayout from '@/app/components/layouts/UserLayout';
import UtilityPurchase from '@/app/components/Profile/UtilityPurchase';
import { BsLightningCharge } from 'react-icons/bs';

const UtilityPage = () => {
  return (
    <UserLayout>
      <Card className="border bg-transparent mb-4">
        <CardHeader className="bg-transparent border-bottom">
          <div className="d-flex align-items-center">
            <div className="icon-md bg-primary text-white rounded-circle me-3 flex-centered">
              <BsLightningCharge size={20} />
            </div>
            <div>
              <h4 className="card-header-title text-dark mb-0">Utilities</h4>
              <p className="small text-secondary mb-0">Recharge airtime and data easily from your wallet</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <Row className="justify-content-center">
            <Col lg={8} xl={6}>
              <UtilityPurchase />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className="border bg-light shadow-sm">
        <CardBody className="p-4">
          <h5 className="mb-3">How it works</h5>
          <div className="vstack gap-3">
            <div className="d-flex align-items-start">
              <div className="bg-primary text-white rounded-circle flex-centered me-3" style={{ width: '24px', height: '24px', flexShrink: 0 }}>1</div>
              <div>
                <h6 className="mb-1">Select Service</h6>
                <p className="small text-secondary mb-0">Choose between Airtime or Data purchase from the tabs above.</p>
              </div>
            </div>
            <div className="d-flex align-items-start">
              <div className="bg-primary text-white rounded-circle flex-centered me-3" style={{ width: '24px', height: '24px', flexShrink: 0 }}>2</div>
              <div>
                <h6 className="mb-1">Fill Details</h6>
                <p className="small text-secondary mb-0">Select your network provider, enter the recipient phone number, and choose your preferred plan or amount.</p>
              </div>
            </div>
            <div className="d-flex align-items-start">
              <div className="bg-primary text-white rounded-circle flex-centered me-3" style={{ width: '24px', height: '24px', flexShrink: 0 }}>3</div>
              <div>
                <h6 className="mb-1">Instant Activation</h6>
                <p className="small text-secondary mb-0">Once you click buy, the amount is deducted from your wallet and the service is activated instantly.</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </UserLayout>
  );
};

export default UtilityPage;
