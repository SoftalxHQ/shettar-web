'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row, Button, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsWallet2, BsBank, BsCopy, BsPlusCircle, BsLightningCharge, BsArrowClockwise, BsChevronLeft, BsCreditCard, BsInfoCircle, BsArrowRight } from 'react-icons/bs';
import { currency } from '@/app/states';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';
import { parseUtilityApiError } from '@/app/helpers/utility-api';
import { authorizationHeaders, getStoredToken, hasAuthSession, isUsableJwt } from '@/app/helpers/auth';
import { getApiBaseUrl } from '@/app/helpers/api-base-url';
import { subscribeCableChannel } from '@/app/helpers/cable';
import { useApi } from '@/app/hooks/useApi';
import { useAppSelector } from '@/lib/store/hooks';

const AccountWallet = () => {
  const { account: profile, isAccountLoading: isLoading, refreshAccount } = useLayoutContext();
  const reduxToken = useAppSelector((s) => s.auth.token);
  const sessionToken = () => (isUsableJwt(reduxToken) ? reduxToken : getStoredToken());
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'dva'>('dva');
  const [feeBreakdown, setFeeBreakdown] = useState<{ target_amount: number; charge_amount: number; paystack_fee: number } | null>(null);
  const [isFetchingFee, setIsFetchingFee] = useState(false);
  const [dvaDetails, setDvaDetails] = useState<{ account_number: string; bank_name: string; account_name: string } | null>(null);
  const [isDvaLoading, setIsDvaLoading] = useState(false);
  const [dvaError, setDvaError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { apiFetch } = useApi();

  const fetchDvaDetails = async () => {
    setIsDvaLoading(true);
    setDvaError(null);
    try {
      const token = sessionToken();
      const response = await apiFetch(`${getApiBaseUrl()}/api/v1/wallet/dva_details`, {
        headers: { ...authorizationHeaders(token) }
      });
      const data = await response.json().catch(() => null);
      if (response.ok) {
        setDvaDetails(data);
        return;
      }
      const message = parseUtilityApiError(data, 'Could not generate a virtual account.');
      setDvaError(message);
      toast.error(message, { duration: 6000 });
    } catch {
      const message = 'Could not generate a virtual account. Please try again.';
      setDvaError(message);
      toast.error(message);
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

    const token = sessionToken();
    if (!hasAuthSession() && !isUsableJwt(token)) return;

    return subscribeCableChannel(
      { channel: 'WalletChannel' },
      {
        received: (data: { event?: string; amount?: number; reference?: string }) => {
          if (data.event === 'balance_updated') {
            if (Number(data.amount) > 0) {
              toast.success(`Success! Wallet credited with ${currency}${data.amount}`, { id: data.reference });
            }
            refreshAccount?.();
          }
        },
      },
      token,
    );
  }, [profile, refreshAccount, reduxToken]);

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

  // Calculate fee breakdown when amount or payment method changes
  useEffect(() => {
    const num = Number(amount);
    if (!num || num < 100) {
      setFeeBreakdown(null);
      return;
    }

    const calculateCardFee = (target: number) => {
      let gross: number;
      if (target < 2500) {
        gross = target / (1 - 0.015);
      } else {
        gross = (target + 100) / (1 - 0.015);
        if (gross - target > 2000) gross = target + 2000;
      }
      gross = Math.round(gross * 100) / 100;
      return { target_amount: target, charge_amount: gross, paystack_fee: Math.round((gross - target) * 100) / 100 };
    };

    const calculateDvaFee = (target: number) => {
      const uncappedGross = target / (1 - 0.01);
      const uncappedFee = uncappedGross - target;
      const gross = Math.round((uncappedFee > 300 ? target + 300 : uncappedGross) * 100) / 100;
      return { target_amount: target, charge_amount: gross, paystack_fee: Math.round((gross - target) * 100) / 100 };
    };

    setFeeBreakdown(paymentMethod === 'card' ? calculateCardFee(num) : calculateDvaFee(num));
  }, [amount, paymentMethod]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'dva') return;

    if (!amount || Number(amount) < 100) {
      toast.error('Minimum top-up is ₦100');
      return;
    }

    setIsProcessing(true);
    try {
      const token = sessionToken();
      const API_URL = getApiBaseUrl();

      // 1. Initialize topup on backend — pass payment method so backend calculates gross amount
      const response = await apiFetch(`${API_URL}/api/v1/wallet/initialize_topup`, {
        method: 'POST',
        headers: {
          ...authorizationHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(amount), payment_method: paymentMethod })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to initialize payment');
      }

      // Open Paystack with the GROSS amount (includes fee passed to customer)
      const chargeAmount = data.charge_amount || Number(amount);
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      const email = data.email || profile?.email;
      const PaystackPop = (window as any).PaystackPop;
      if (!paystackKey || !email || !PaystackPop) {
        throw new Error(
          !email
            ? 'Add an email to your account before paying with Paystack.'
            : 'Paystack is still loading. Please try again.'
        );
      }

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: paystackKey,
        email,
        amount: Math.round(Number(chargeAmount) * 100),
        currency: 'NGN',
        ref: data.reference,
        reference: data.reference,
        ...(data.metadata && typeof data.metadata === 'object' ? { metadata: data.metadata } : {}),
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        onSuccess: (transaction: { reference?: string }) => {
          void verifyPayment(transaction?.reference || data.reference);
        },
        onCancel: () => {
          setIsProcessing(false);
        },
        onError: (error: { message?: string }) => {
          toast.error(error?.message || 'Payment could not start');
          setIsProcessing(false);
        }
      });

    } catch (error: any) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const token = sessionToken();
      const API_URL = getApiBaseUrl();

      const response = await apiFetch(`${API_URL}/api/v1/wallet/verify_topup`, {
        method: 'POST',
        headers: {
          ...authorizationHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message !== "Transaction already processed") {
          toast.success(data.message, { id: reference });
        }
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
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="icon-md bg-dark text-white rounded-circle me-3 flex-centered">
                    <BsBank size={20} />
                  </div>
                  <h5 className="mb-0">Virtual Account</h5>
                </div>
                <span className="badge bg-success text-white" style={{ fontSize: '0.7rem' }}>Recommended</span>
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
                    <p className="mb-0 mt-2 text-danger fw-semibold" style={{ fontSize: '0.65rem', lineHeight: 1.3 }}>
                      1% Paystack fee on transfers (max ₦300)
                    </p>
                  </div>

                  <div className="row g-2">
                    <Col xs={6}>
                      <p className="small mb-1 text-secondary">Bank Name</p>
                      <h6 className="mb-0">{dvaDetails.bank_name}</h6>
                    </Col>
                    <Col xs={6}>
                      <p className="small mb-1 text-secondary">Account Holder</p>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="dva-account-holder">{dvaDetails.account_name}</Tooltip>}
                      >
                        <h6 className="text-truncate mb-0" style={{ cursor: 'default' }}>{dvaDetails.account_name}</h6>
                      </OverlayTrigger>
                    </Col>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className={`small mb-3 ${dvaError ? 'text-danger' : 'text-muted'}`}>
                    {dvaError || 'No bank account assigned yet.'}
                  </p>
                  {dvaError?.toLowerCase().includes('phone') ? (
                    <Link href="/user/profile" className="btn btn-sm btn-outline-dark mb-0">
                      Add phone number
                    </Link>
                  ) : (
                    <Button variant="outline-dark" size="sm" onClick={fetchDvaDetails} disabled={isDvaLoading}>
                      {isDvaLoading ? 'Generating...' : 'Generate Bank Account'}
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal show={showTopUp} onHide={() => !isProcessing && setShowTopUp(false)} centered scrollable fullscreen="sm-down" contentClassName="border-0">
        <Modal.Header className="border-0 px-3 pt-3 pb-0">
          <button
            type="button"
            className="btn btn-link text-body p-0 d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40 }}
            onClick={() => { if (!isProcessing) { setShowTopUp(false); setAmount(''); setFeeBreakdown(null); } }}
            disabled={isProcessing}
            aria-label="Close"
          >
            <BsChevronLeft size={22} />
          </button>
          <Modal.Title className="fs-6 fw-bold mb-0 flex-grow-1 text-center">Fund Wallet</Modal.Title>
          <span style={{ width: 40 }} aria-hidden="true" />
        </Modal.Header>
        <Form onSubmit={handleTopUp} className="d-flex flex-column flex-grow-1 min-h-0">
          <Modal.Body className="px-4 pt-3 pb-4">
            <p className="text-secondary fw-bold text-uppercase mb-3" style={{ fontSize: 12, letterSpacing: 0.8 }}>Payment Method</p>
            <div className="d-flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('dva')}
                className="text-start bg-mode p-3"
                style={{
                  flex: '1 1 8.5rem',
                  borderRadius: 16,
                  cursor: 'pointer',
                  border: paymentMethod === 'dva' ? '2px solid var(--bs-primary)' : '1px solid var(--bs-border-color)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <BsBank size={20} className={paymentMethod === 'dva' ? 'text-primary' : 'text-secondary'} />
                  <span className="badge bg-success" style={{ fontSize: 9, fontWeight: 800 }}>Recommended</span>
                </div>
                <div className={`fw-bold ${paymentMethod === 'dva' ? 'text-primary' : 'text-body'}`} style={{ fontSize: 14 }}>Bank Transfer</div>
                <div className="text-secondary" style={{ fontSize: 11 }}>1% fee, max ₦300</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className="text-start bg-mode p-3"
                style={{
                  flex: '1 1 8.5rem',
                  borderRadius: 16,
                  cursor: 'pointer',
                  border: paymentMethod === 'card' ? '2px solid var(--bs-primary)' : '1px solid var(--bs-border-color)',
                }}
              >
                <div className="d-flex align-items-center mb-2">
                  <BsCreditCard size={20} className={paymentMethod === 'card' ? 'text-primary' : 'text-secondary'} />
                </div>
                <div className={`fw-bold ${paymentMethod === 'card' ? 'text-primary' : 'text-body'}`} style={{ fontSize: 14 }}>Paystack</div>
                <div className="text-secondary" style={{ fontSize: 11 }}>Card, bank, USSD, transfer</div>
              </button>
            </div>

            <p className="text-secondary fw-bold text-uppercase mb-3 mt-4" style={{ fontSize: 12, letterSpacing: 0.8 }}>Amount to Fund</p>
            <div className="d-flex align-items-center border-bottom border-primary border-2 pb-2">
              <span className="fw-bold text-body me-1" style={{ fontSize: 32 }}>{currency}</span>
              <Form.Control
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className="border-0 shadow-none bg-transparent fw-bold px-0"
                style={{ fontSize: 32 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                disabled={isProcessing}
                aria-label="Amount to fund"
              />
            </div>

            <div className="d-flex gap-2 mt-4">
              {[1000, 2000, 5000, 10000].map(amt => {
                const selected = amount === amt.toString();
                return (
                  <button
                    key={amt}
                    type="button"
                    className={`btn flex-grow-1 fw-bold ${selected ? 'btn-primary text-white' : 'btn-outline-primary'}`}
                    style={{ borderRadius: 12, fontSize: 12, padding: '10px 4px' }}
                    onClick={() => setAmount(amt.toString())}
                    disabled={isProcessing}
                  >
                    +{currency}{amt.toLocaleString('en-NG')}
                  </button>
                );
              })}
            </div>

            {feeBreakdown && Number(amount) >= 100 && (
              <div className="mt-4 p-3 border border-primary border-opacity-25 bg-primary bg-opacity-10" style={{ borderRadius: 14 }}>
                <p className="fw-bold text-uppercase text-body mb-2" style={{ fontSize: 12, letterSpacing: 0.5 }}>Breakdown</p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary" style={{ fontSize: 13 }}>Wallet credit</span>
                  <span className="fw-bold text-body" style={{ fontSize: 13 }}>{currency}{feeBreakdown.target_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <span className="text-secondary" style={{ fontSize: 13 }}>
                    {paymentMethod === 'card' ? 'Paystack fee (1.5% + ₦100)' : 'DVA fee (1%, max ₦300)'}
                  </span>
                  <span className="fw-bold text-danger text-nowrap" style={{ fontSize: 13 }}>+{currency}{feeBreakdown.paystack_fee.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center gap-2 border-top pt-2 mt-1">
                  <span className="fw-bold text-body" style={{ fontSize: 13 }}>
                    {paymentMethod === 'dva' ? 'Transfer exactly' : 'You will be charged'}
                  </span>
                  <span className="fw-bold text-primary text-nowrap" style={{ fontSize: 13 }}>{currency}{feeBreakdown.charge_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'dva' && (
              <div className="mt-4 p-3 border bg-mode" style={{ borderRadius: 16 }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <BsBank size={16} className="text-success" />
                  <span className="fw-bold text-body" style={{ fontSize: 14 }}>Transfer to your Virtual Account</span>
                </div>

                {isDvaLoading && !dvaDetails ? (
                  <div className="spinner-border spinner-border-sm text-primary my-3" role="status" aria-label="Loading virtual account" />
                ) : dvaDetails ? (
                  <>
                    <div className="d-flex align-items-center justify-content-between gap-2 pb-3 mb-3 border-bottom">
                      <div className="min-w-0">
                        <p className="text-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: 0.5 }}>Account Number</p>
                        <p className="fw-bold text-body mb-1" style={{ fontSize: 20, letterSpacing: 1.5 }}>{dvaDetails.account_number}</p>
                        <p className="mb-0 text-danger fw-bold" style={{ fontSize: 10, lineHeight: 1.3 }}>
                          1% Paystack fee on transfers (max ₦300)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn border-0 text-primary d-flex align-items-center gap-1 fw-bold flex-shrink-0"
                        style={{ borderRadius: 10, fontSize: 13, backgroundColor: 'rgba(var(--bs-primary-rgb), 0.08)' }}
                        onClick={() => copyToClipboard(dvaDetails.account_number)}
                      >
                        <BsCopy size={16} />
                        Copy
                      </button>
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <p className="text-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: 0.5 }}>Bank</p>
                        <p className="fw-semibold text-body mb-0" style={{ fontSize: 14 }}>{dvaDetails.bank_name}</p>
                      </div>
                      <div className="col-6">
                        <p className="text-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: 11, letterSpacing: 0.5 }}>Account Name</p>
                        <p className="fw-semibold text-body mb-0 text-truncate" style={{ fontSize: 14 }} title={dvaDetails.account_name}>{dvaDetails.account_name}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={`mb-2 ${dvaError ? 'text-danger' : 'text-secondary'}`} style={{ fontSize: 13 }}>
                      {dvaError || 'Virtual account not available. Please try again.'}
                    </p>
                    {dvaError?.toLowerCase().includes('phone') ? (
                      <Link href="/user/profile" className="fw-bold text-decoration-none">Add phone number</Link>
                    ) : (
                      <Button variant="link" className="p-0 fw-bold" onClick={fetchDvaDetails} disabled={isDvaLoading}>
                        Try again
                      </Button>
                    )}
                  </>
                )}

                <div className="d-flex align-items-start gap-2 mt-3 p-3 border border-success border-opacity-25 bg-success bg-opacity-10" style={{ borderRadius: 12 }}>
                  <BsInfoCircle size={16} className="text-success flex-shrink-0 mt-1" />
                  <p className="text-secondary mb-0" style={{ fontSize: 12, lineHeight: 1.5 }}>
                    Transfer the exact amount shown in the breakdown above. Your wallet will be credited automatically.
                  </p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pt-2 pb-4">
            {paymentMethod === 'dva' ? (
              <Button variant="secondary" className="w-100 d-flex align-items-center justify-content-center fw-bold" disabled style={{ height: 56, borderRadius: 16, opacity: 0.4, fontSize: 16 }}>
                <BsBank className="me-2" />
                Transfer to Virtual Account
              </Button>
            ) : (
              <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center fw-bold" type="submit" disabled={isProcessing || !amount} style={{ height: 56, borderRadius: 16, fontSize: 16 }}>
                {isProcessing ? 'Processing...' : (
                  <>
                    Pay {feeBreakdown ? `${currency}${feeBreakdown.charge_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '...'}
                    <BsArrowRight className="ms-2" />
                  </>
                )}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AccountWallet;
