'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { BsWallet2, BsBank, BsCopy, BsPlusCircle, BsLightningCharge, BsArrowClockwise } from 'react-icons/bs';
import { currency } from '@/app/states';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';
import { getStoredToken } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';

import { createConsumer } from '@rails/actioncable';

const AccountWallet = () => {
  const { account: profile, isAccountLoading: isLoading, refreshAccount } = useLayoutContext();
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dvaDetails, setDvaDetails] = useState<{ account_number: string; bank_name: string; account_name: string } | null>(null);
  const [isDvaLoading, setIsDvaLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { apiFetch } = useApi();

  const fetchDvaDetails = async () => {
    setIsDvaLoading(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/api/v1/wallet/dva_details`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await response.json();
      if (response.ok) {
        setDvaDetails(data);
      }
    } catch (error) {
      console.error('Error fetching DVA details:', error);
    } finally {
      setIsDvaLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchDvaDetails();
    }
  }, [profile]);

  // Handle Real-time updates via ActionCable (WebSocket)
  useEffect(() => {
    if (!profile) return;

    const token = getStoredToken();
    if (!token) return;

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    const wsUrl = API_URL.replace(/^http/, 'ws') + '/cable';

    // Pass token in URL params for ActionCable auth
    const consumer = createConsumer(`${wsUrl}?token=${token}`);

    const subscription = consumer.subscriptions.create(
      { channel: 'WalletChannel' },
      {
        received: (data: any) => {
          if (data.event === 'balance_updated') {
            toast.success(`Success! Wallet credited with ${currency}${data.amount}`);
            refreshAccount?.();
          }
        },
        connected: () => console.log('Connected to WalletChannel'),
        disconnected: () => console.log('Disconnected from WalletChannel')
      }
    );

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [profile, refreshAccount]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAccount?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const balance = profile?.wallet_balance != null
    ? Number(profile.wallet_balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      toast.error('Minimum top-up is 100');
      return;
    }

    setIsProcessing(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

      // 1. Initialize topup on backend
      const response = await apiFetch(`${API_URL}/api/v1/wallet/initialize_topup`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(amount) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to initialize payment');
      }

      // 2. Open Paystack
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: profile?.email,
        amount: Number(amount) * 100, // in kobo
        ref: data.reference,
        onClose: () => {
          setIsProcessing(false);
        },
        callback: async (response: any) => {
          // 3. Verify on backend
          await verifyPayment(response.reference);
        }
      });
      handler.openIframe();

    } catch (error: any) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

      const response = await apiFetch(`${API_URL}/api/v1/wallet/verify_topup`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setShowTopUp(false);
        setAmount('');
        refreshAccount?.(); // Refresh the account balance
      } else {
        throw new Error(data.errors?.[0]?.message || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Row className="g-4">
        <Col md={6}>
          <Card className="bg-primary bg-opacity-10 border border-primary border-opacity-25 h-100 shadow-sm">
            <CardBody className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="icon-md bg-primary text-white rounded-circle me-3 flex-centered">
                    <BsWallet2 size={20} />
                  </div>
                  <h5 className="mb-0">Wallet Balance</h5>
                </div>
                <Button
                  variant="link"
                  className={`p-0 text-primary ${isRefreshing ? 'opacity-50' : ''}`}
                  onClick={handleManualRefresh}
                  disabled={isRefreshing || isLoading}
                  title="Refresh balance"
                >
                  <BsArrowClockwise size={18} className={isRefreshing ? 'spin' : ''} />
                </Button>
              </div>

              {isLoading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-5 d-block mb-2" style={{ height: 36 }} />
                  <span className="placeholder col-4 d-block mb-4" />
                </div>
              ) : (
                <>
                  <h3 className="mb-1">{currency}{balance}</h3>
                  <p className="small mb-4 opacity-75">Available balance</p>
                </>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="mb-0 flex-centered"
                  onClick={() => setShowTopUp(true)}
                >
                  <BsPlusCircle className="me-2" /> Top Up
                </Button>
                <Link href="/user/transactions" className="btn btn-sm btn-outline-primary mb-0 flex-centered">History</Link>
                <Link href="/user/utility" className="btn btn-sm btn-light mb-0 flex-centered">
                  <BsLightningCharge className="me-2" /> Utilities
                </Link>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="bg-light border h-100 shadow-sm">
            <CardBody className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-md bg-dark text-white rounded-circle me-3 flex-centered">
                  <BsBank size={20} />
                </div>
                <h5 className="mb-0">Virtual Account</h5>
              </div>

              {isDvaLoading && !dvaDetails ? (
                <div className="placeholder-glow">
                  <div className="bg-mode p-3 rounded border mb-3">
                    <span className="placeholder col-4 d-block mb-2" />
                    <span className="placeholder col-8 d-block" />
                  </div>
                  <div className="row g-2">
                    <Col xs={6}><span className="placeholder col-6 d-block mb-1" /><span className="placeholder col-10 d-block" /></Col>
                    <Col xs={6}><span className="placeholder col-6 d-block mb-1" /><span className="placeholder col-10 d-block" /></Col>
                  </div>
                </div>
              ) : dvaDetails ? (
                <>
                  <div className="bg-mode p-3 rounded border mb-3">
                    <p className="small mb-1 text-secondary">Account Number</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="mb-0 text-primary tracking-wider">{dvaDetails.account_number.match(/.{1,4}/g)?.join(' ') || dvaDetails.account_number}</h3>
                      <Button variant="link" className="p-0 text-primary" onClick={() => copyToClipboard(dvaDetails.account_number)}>
                        <BsCopy size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="row g-2">
                    <Col xs={6}>
                      <p className="small mb-1 text-secondary">Bank Name</p>
                      <h6 className="mb-0">{dvaDetails.bank_name}</h6>
                    </Col>
                    <Col xs={6}>
                      <p className="small mb-1 text-secondary">Account Holder</p>
                      <h6 className="text-truncate mb-0">{dvaDetails.account_name}</h6>
                    </Col>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="small text-muted mb-3">No bank account assigned yet.</p>
                  <Button variant="outline-dark" size="sm" onClick={fetchDvaDetails} disabled={isDvaLoading}>
                    {isDvaLoading ? 'Generating...' : 'Generate Bank Account'}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal show={showTopUp} onHide={() => !isProcessing && setShowTopUp(false)} centered>
        <Modal.Header closeButton={!isProcessing}>
          <Modal.Title>Fund Your Wallet</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleTopUp}>
          <Modal.Body className="p-4">
            <p className="text-secondary small mb-4">Enter an amount to add to your wallet. You will be redirected to Paystack for secure payment.</p>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Amount to Fund</Form.Label>
              <InputGroup size="lg">
                <InputGroup.Text className="bg-light">{currency}</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  required
                  disabled={isProcessing}
                />
              </InputGroup>
              <Form.Text className="text-muted">Minimum funding amount is {currency}100.00</Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 mt-4">
              {[500, 1000, 2000, 5000].map(amt => (
                <Button
                  key={amt}
                  variant="outline-secondary"
                  size="sm"
                  className="flex-grow-1"
                  onClick={() => setAmount(amt.toString())}
                  disabled={isProcessing}
                >
                  +{amt}
                </Button>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 pt-0">
            <Button variant="white" onClick={() => setShowTopUp(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isProcessing || !amount}>
              {isProcessing ? 'Processing...' : 'Proceed to Pay'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AccountWallet;
