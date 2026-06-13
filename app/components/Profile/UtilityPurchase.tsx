'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { BsCheckCircleFill, BsPerson, BsTelephone, BsWallet2, BsWifi } from 'react-icons/bs';
import confetti from 'canvas-confetti';
import { useLayoutContext, currency } from '@/app/states';
import { toast } from 'react-hot-toast';
import UtilityReceiptCard, { type UtilityReceipt } from '@/app/components/Profile/Utility/UtilityReceiptCard';
import {
  buyAirtime,
  buyData,
  fetchDataVariations,
  fetchUtilityNetworks,
  type DataVariation,
  type UtilityNetwork,
} from '@/app/helpers/utility-api';

type TabType = 'airtime' | 'data';

const QUICK_AMOUNTS = [100, 200, 500, 1000];

function fireConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

const UtilityPurchase = () => {
  const { account: profile, refreshAccount } = useLayoutContext();
  const [activeTab, setActiveTab] = useState<TabType>('airtime');
  const [networks, setNetworks] = useState<UtilityNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [amount, setAmount] = useState('');
  const [dataPlans, setDataPlans] = useState<DataVariation[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataVariation | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<UtilityReceipt | null>(null);

  const balance = Number(profile?.wallet_balance || 0);
  const airtimeValue = Number(amount);
  const canPurchase = useMemo(() => {
    const hasPhone = phoneNumber.trim().length > 0;
    const hasNetwork = Boolean(selectedNetwork);

    if (activeTab === 'airtime') {
      return hasNetwork && hasPhone && airtimeValue >= 50 && airtimeValue <= balance;
    }

    return hasNetwork && hasPhone && Boolean(selectedPlan) && (selectedPlan?.amount ?? 0) <= balance;
  }, [activeTab, airtimeValue, balance, phoneNumber, selectedNetwork, selectedPlan]);

  useEffect(() => {
    fetchUtilityNetworks().then((list) => {
      setNetworks(list);
      if (list[0]) setSelectedNetwork(list[0].name);
    });
  }, []);

  useEffect(() => {
    if (activeTab !== 'data' || !selectedNetwork) return;
    setLoadingPlans(true);
    fetchDataVariations(selectedNetwork)
      .then((plans) => {
        setDataPlans(plans);
        setSelectedPlan(null);
      })
      .finally(() => setLoadingPlans(false));
  }, [activeTab, selectedNetwork]);

  const handlePurchase = useCallback(async () => {
    if (!selectedNetwork) {
      toast.error('Please select a network');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setPurchaseError(null);
    setLoading(true);
    try {
      if (activeTab === 'airtime') {
        const value = Number(amount);
        if (!value || value < 50) {
          const message = 'Minimum airtime amount is ₦50';
          setPurchaseError(message);
          toast.error(message);
          return;
        }
        if (value > balance) {
          const message = 'Insufficient wallet balance';
          setPurchaseError(message);
          toast.error(message);
          return;
        }
        const result = await buyAirtime({
          network: selectedNetwork,
          phone_number: phoneNumber,
          amount: value,
        });
        await refreshAccount?.();
        const nextReceipt: UtilityReceipt = {
          type: 'Airtime',
          amount: String(value),
          recipient: phoneNumber,
          network: selectedNetwork,
          status: (result.status as UtilityReceipt['status']) || 'delivered',
          requestId: result.request_id,
          purchasedAt: new Date().toISOString(),
        };
        setReceipt(nextReceipt);
        if (nextReceipt.status === 'delivered') fireConfetti();
      } else {
        if (!selectedPlan) {
          const message = 'Please select a data plan';
          setPurchaseError(message);
          toast.error(message);
          return;
        }
        if (selectedPlan.amount > balance) {
          const message = 'Insufficient wallet balance';
          setPurchaseError(message);
          toast.error(message);
          return;
        }
        const result = await buyData({
          network: selectedNetwork,
          phone_number: phoneNumber,
          variation_code: selectedPlan.variation_code,
          amount: selectedPlan.amount,
        });
        await refreshAccount?.();
        const nextReceipt: UtilityReceipt = {
          type: 'Data Bundle',
          amount: String(selectedPlan.amount),
          recipient: phoneNumber,
          network: selectedNetwork,
          plan: selectedPlan.name,
          status: (result.status as UtilityReceipt['status']) || 'delivered',
          requestId: result.request_id,
          purchasedAt: new Date().toISOString(),
        };
        setReceipt(nextReceipt);
        if (nextReceipt.status === 'delivered') fireConfetti();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Purchase failed. Your wallet has been refunded.';
      setPurchaseError(message);
      toast.error(message, { duration: 6000 });
      await refreshAccount?.();
    } finally {
      setLoading(false);
    }
  }, [activeTab, amount, balance, phoneNumber, refreshAccount, selectedNetwork, selectedPlan]);

  const resetPurchase = () => {
    setReceipt(null);
    setPurchaseError(null);
    setAmount('');
    setSelectedPlan(null);
  };

  if (receipt) {
    return (
      <div className="utility-purchase">
        <div className="text-center mb-4">
          <BsCheckCircleFill
            size={72}
            className={receipt.status === 'pending' ? 'text-warning mb-3' : 'text-success mb-3'}
          />
          <h4 className="fw-bold mb-2">
            {receipt.status === 'pending' ? 'Purchase Processing' : 'Purchase Successful!'}
          </h4>
          <p className="text-secondary small mb-0">
            {receipt.status === 'pending'
              ? 'Your purchase is being processed. We will notify you when it completes.'
              : `Your ${receipt.type.toLowerCase()} has been delivered to ${receipt.recipient}.`}
          </p>
        </div>

        <UtilityReceiptCard receipt={receipt} />

        <button type="button" className="btn btn-outline-primary w-100 py-3 rounded-4 fw-bold mt-4" onClick={resetPurchase}>
          Make Another Purchase
        </button>
      </div>
    );
  }

  return (
    <div className="utility-purchase">
      <div className="utility-balance-card bg-primary text-white rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <p className="small mb-1 opacity-75">Wallet Balance</p>
          <h3 className="mb-0 text-white fw-bold">
            {currency}
            {balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="utility-wallet-icon bg-white rounded-circle d-flex align-items-center justify-content-center">
          <BsWallet2 size={24} className="text-primary" />
        </div>
      </div>

      <div className="utility-toggle mb-4 p-1 rounded-4 d-flex" style={{ background: 'rgba(81, 67, 217, 0.12)' }}>
        <button
          type="button"
          className={`utility-toggle-btn flex-fill border-0 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2 ${activeTab === 'airtime' ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
          onClick={() => setActiveTab('airtime')}
        >
          <BsTelephone /> Airtime
        </button>
        <button
          type="button"
          className={`utility-toggle-btn flex-fill border-0 rounded-3 py-3 d-flex align-items-center justify-content-center gap-2 ${activeTab === 'data' ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
          onClick={() => setActiveTab('data')}
        >
          <BsWifi /> Data Bundle
        </button>
      </div>

      <div className="mb-4">
        <label className="small fw-semibold text-secondary mb-2 d-block">Network</label>
        <div className="row g-2">
          {networks.map((n) => (
            <div key={n.name} className="col-3">
              <button
                type="button"
                onClick={() => setSelectedNetwork(n.name)}
                className={`w-100 border rounded-3 py-2 small fw-bold ${selectedNetwork === n.name ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'bg-light'}`}
              >
                {n.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="small fw-semibold text-secondary mb-2 d-block">Phone Number</label>
        <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light">
          <BsPerson className="text-secondary me-2" />
          <input
            type="tel"
            className="form-control border-0 bg-transparent shadow-none"
            placeholder="e.g. 08012345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'airtime' ? (
        <div className="mb-4">
          <label className="small fw-semibold text-secondary mb-2 d-block">Amount</label>
          <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light mb-3">
            <span className="fw-bold me-2">{currency}</span>
            <input
              type="number"
              className="form-control border-0 bg-transparent shadow-none fw-bold"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="d-flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="btn btn-outline-primary btn-sm rounded-pill"
                onClick={() => setAmount(String(chip))}
              >
                {currency}
                {chip}
              </button>
            ))}
          </div>
          <p className="small text-muted mt-2 mb-0">Minimum: {currency}50</p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="small fw-semibold text-secondary mb-2 d-block">Select Plan</label>
          {loadingPlans ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <div className="row g-3">
              {dataPlans.map((plan, index) => (
                <div key={`${plan.variation_code}-${plan.amount}-${index}`} className="col-6 col-md-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`utility-plan-card w-100 text-start border rounded-4 p-3 h-100 ${selectedPlan === plan ? 'border-primary bg-primary bg-opacity-10' : 'bg-light'}`}
                  >
                    <div className="fw-bold mb-2">{plan.name}</div>
                    <div className="text-primary fw-bold">
                      {currency}
                      {plan.amount.toLocaleString()}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {purchaseError ? (
        <Alert variant="danger" className="mb-3" onClose={() => setPurchaseError(null)} dismissible>
          <strong>Purchase failed.</strong> {purchaseError}
        </Alert>
      ) : null}

      <div className="utility-footer-cta pt-2">
        <button
          type="button"
          className="btn btn-primary w-100 py-3 rounded-4 fw-bold"
          onClick={handlePurchase}
          disabled={loading || !canPurchase}
        >
          {loading ? <Spinner animation="border" size="sm" /> : activeTab === 'airtime' ? 'Buy Airtime' : 'Purchase Bundle'}
        </button>
      </div>

      <style jsx>{`
        .utility-wallet-icon {
          width: 48px;
          height: 48px;
        }
        .utility-input-box {
          min-height: 56px;
        }
        .utility-plan-card {
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        @media (min-width: 768px) {
          .utility-footer-cta {
            position: static;
          }
        }
        @media (max-width: 767.98px) {
          .utility-footer-cta {
            position: sticky;
            bottom: 0;
            background: var(--bs-body-bg, #fff);
            padding-bottom: env(safe-area-inset-bottom);
            z-index: 10;
          }
        }
      `}</style>
    </div>
  );
};

export default UtilityPurchase;
