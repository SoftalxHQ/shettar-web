'use client';

import { useState } from 'react';
import { Card, CardBody, Form, Button, Row, Col, Nav, Tab, InputGroup, Spinner } from 'react-bootstrap';
import { BsPhone, BsLightningCharge, BsWallet2 } from 'react-icons/bs';
import { useLayoutContext, currency } from '@/app/states';
import { getStoredToken } from '@/app/helpers/auth';
import { toast } from 'react-hot-toast';

const networks = [
  { name: 'MTN', value: 'MTN', color: '#FFCC00' },
  { name: 'Airtel', value: 'Airtel', color: '#FF0000' },
  { name: 'Glo', value: 'Glo', color: '#00FF00' },
  { name: '9mobile', value: '9mobile', color: '#006633' },
];

const dataPlans = [
  { name: '1GB - 1 Day', amount: 300, value: '1GB_1D' },
  { name: '2GB - 2 Days', amount: 500, value: '2GB_2D' },
  { name: '5GB - 7 Days', amount: 1500, value: '5GB_7D' },
  { name: '10GB - 30 Days', amount: 3000, value: '10GB_30D' },
  { name: '20GB - 30 Days', amount: 5000, value: '20GB_30D' },
];

const UtilityPurchase = () => {
  const { account: profile, refreshAccount } = useLayoutContext();
  const [activeTab, setActiveTab] = useState('airtime');
  const [loading, setLoading] = useState(false);

  // Form states
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [amount, setAmount] = useState('');
  const [dataPlan, setDataPlan] = useState<any>(null);

  const balance = profile?.wallet_balance || 0;

  const handleAirtimePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!network || !phoneNumber || !amount) {
      toast.error('Please fill all fields');
      return;
    }

    if (Number(amount) > balance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

      const response = await fetch(`${API_URL}/api/v1/wallet/buy_airtime`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(amount),
          phone_number: phoneNumber,
          network: network,
          option: 'other' // we use the provided phone number
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setAmount('');
        refreshAccount?.();
      } else {
        throw new Error(data.errors?.[0]?.message || 'Purchase failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!network || !phoneNumber || !dataPlan) {
      toast.error('Please select a network and plan');
      return;
    }

    if (dataPlan.amount > balance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

      const response = await fetch(`${API_URL}/api/v1/wallet/buy_data`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: dataPlan.amount,
          phone_number: phoneNumber,
          network: network,
          data_plan: dataPlan.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setDataPlan(null);
        refreshAccount?.();
      } else {
        throw new Error(data.errors?.[0]?.message || 'Purchase failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border shadow-sm overflow-hidden">
      <div className="bg-primary p-4 text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="small mb-1 opacity-75">Payable Balance</p>
            <h3 className="mb-0 text-white">{currency}{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</h3>
          </div>
          <BsWallet2 size={32} className="opacity-50" />
        </div>
      </div>

      <CardBody className="p-0">
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'airtime')}>
          <Nav className="nav-tabs nav-justified border-top-0">
            <Nav.Item>
              <Nav.Link eventKey="airtime" className="py-3 items-center flex-centered rounded-0 border-0">
                <BsPhone className="me-2" /> Airtime
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="data" className="py-3 items-center flex-centered rounded-0 border-0">
                <BsLightningCharge className="me-2" /> Data
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="p-4">
            <Tab.Pane eventKey="airtime">
              <Form onSubmit={handleAirtimePurchase}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Select Network</Form.Label>
                  <Row className="g-2">
                    {networks.map((n) => (
                      <Col key={n.value} xs={3}>
                        <div
                          onClick={() => setNetwork(n.value)}
                          className={`border rounded p-2 text-center cursor-pointer transition-all ${network === n.value ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold shadow-sm' : 'bg-light'
                            }`}
                        >
                          <small>{n.name}</small>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{currency}</InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <Form.Text className="text-muted small">Min: 50.00</Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-3" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : `Buy Airtime`}
                </Button>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="data">
              <Form onSubmit={handleDataPurchase}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Select Network</Form.Label>
                  <Row className="g-2">
                    {networks.map((n) => (
                      <Col key={n.value} xs={3}>
                        <div
                          onClick={() => setNetwork(n.value)}
                          className={`border rounded p-2 text-center cursor-pointer transition-all ${network === n.value ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold shadow-sm' : 'bg-light'
                            }`}
                        >
                          <small>{n.name}</small>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Select Data Plan</Form.Label>
                  <div className="vstack gap-2">
                    {dataPlans.map((plan) => (
                      <div
                        key={plan.value}
                        onClick={() => setDataPlan(plan)}
                        className={`d-flex justify-content-between align-items-center p-3 border rounded cursor-pointer transition-all ${dataPlan?.value === plan.value ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-light'
                          }`}
                      >
                        <div className="d-flex flex-column">
                          <span className="fw-bold">{plan.name}</span>
                        </div>
                        <span className="fw-bold text-primary">{currency}{plan.amount}</span>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-3 mt-2" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : `Purchase Data ${dataPlan ? `(${currency}${dataPlan.amount})` : ''}`}
                </Button>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </CardBody>
    </Card>
  );
};

export default UtilityPurchase;
