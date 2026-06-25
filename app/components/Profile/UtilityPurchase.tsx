'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import {
  BsCheckCircleFill,
  BsLightningChargeFill,
  BsPerson,
  BsTelephone,
  BsTv,
  BsWallet2,
  BsWifi,
} from 'react-icons/bs';
import confetti from 'canvas-confetti';
import { useLayoutContext, currency } from '@/app/states';
import { toast } from 'react-hot-toast';
import { useTransactionPin } from '@/app/hooks/useTransactionPin';
import UtilityReceiptCard, { type UtilityReceipt } from '@/app/components/Profile/Utility/UtilityReceiptCard';
import {
  buyAirtime,
  buyData,
  buyElectricity,
  buyTv,
  fetchDataVariations,
  fetchElectricityProviders,
  fetchTvProviders,
  fetchTvVariations,
  fetchUtilityNetworks,
  verifyUtilityBill,
  type DataVariation,
  type UtilityNetwork,
  type UtilityProvider,
  type VerifyResult,
} from '@/app/helpers/utility-api';

type TabType = 'airtime' | 'data' | 'tv' | 'electricity';
type TvMode = 'renew' | 'change';
type MeterType = 'prepaid' | 'postpaid';

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
  const { requestTransactionPin, PinModal } = useTransactionPin();
  const [activeTab, setActiveTab] = useState<TabType>('airtime');

  const [networks, setNetworks] = useState<UtilityNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [amount, setAmount] = useState('');
  const [dataPlans, setDataPlans] = useState<DataVariation[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataVariation | null>(null);

  const [tvProviders, setTvProviders] = useState<UtilityProvider[]>([]);
  const [selectedTvProvider, setSelectedTvProvider] = useState('');
  const [smartcard, setSmartcard] = useState('');
  const [tvVerification, setTvVerification] = useState<VerifyResult | null>(null);
  const [tvMode, setTvMode] = useState<TvMode>('renew');
  const [tvRenewAmount, setTvRenewAmount] = useState('');
  const [tvPlans, setTvPlans] = useState<DataVariation[]>([]);
  const [selectedTvPlan, setSelectedTvPlan] = useState<DataVariation | null>(null);
  const [verifyingTv, setVerifyingTv] = useState(false);
  const [tvVerifyError, setTvVerifyError] = useState<string | null>(null);

  const [electricityProviders, setElectricityProviders] = useState<UtilityProvider[]>([]);
  const [selectedElectricityProvider, setSelectedElectricityProvider] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('prepaid');
  const [electricityVerification, setElectricityVerification] = useState<VerifyResult | null>(null);
  const [electricityAmount, setElectricityAmount] = useState('');
  const [verifyingElectricity, setVerifyingElectricity] = useState(false);
  const [electricityVerifyError, setElectricityVerifyError] = useState<string | null>(null);

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<UtilityReceipt | null>(null);

  const balance = Number(profile?.wallet_balance || 0);
  const airtimeValue = Number(amount);
  const electricityValue = Number(electricityAmount);
  const tvPurchaseAmount = tvMode === 'renew'
    ? Number(tvVerification?.renewal_amount || tvRenewAmount || 0)
    : Number(selectedTvPlan?.amount || 0);

  const canPurchase = useMemo(() => {
    const hasPhone = phoneNumber.trim().length > 0;

    if (activeTab === 'airtime') {
      return Boolean(selectedNetwork) && hasPhone && airtimeValue >= 50 && airtimeValue <= balance;
    }
    if (activeTab === 'data') {
      return Boolean(selectedNetwork) && hasPhone && Boolean(selectedPlan) && (selectedPlan?.amount ?? 0) <= balance;
    }
    if (activeTab === 'tv') {
      if (!selectedTvProvider || !smartcard.trim() || !tvVerification) return false;
      if (tvMode === 'renew') return tvPurchaseAmount > 0 && tvPurchaseAmount <= balance;
      return Boolean(selectedTvPlan) && tvPurchaseAmount > 0 && tvPurchaseAmount <= balance;
    }
    if (!selectedElectricityProvider || !meterNumber.trim() || !electricityVerification) return false;
    if (meterType === 'postpaid') {
      const bill = electricityVerification.outstanding_balance ?? 0;
      return bill > 0 && bill <= balance;
    }
    return electricityValue >= (electricityVerification.minimum_amount ?? 500) && electricityValue <= balance;
  }, [
    activeTab,
    airtimeValue,
    balance,
    electricityValue,
    electricityVerification,
    meterNumber,
    meterType,
    phoneNumber,
    selectedElectricityProvider,
    selectedNetwork,
    selectedPlan,
    selectedTvPlan,
    selectedTvProvider,
    smartcard,
    tvMode,
    tvPurchaseAmount,
    // tvRenewAmount,
    tvVerification,
  ]);

  useEffect(() => {
    fetchUtilityNetworks().then((list) => {
      setNetworks(list);
      if (list[0]) setSelectedNetwork(list[0].name);
    });
    fetchTvProviders()
      .then((list) => {
        setTvProviders(list);
        if (list[0]) setSelectedTvProvider(list[0].name);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Could not load TV providers');
      });
    fetchElectricityProviders()
      .then((list) => {
        setElectricityProviders(list);
        if (list[0]) setSelectedElectricityProvider(list[0].name);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Could not load electricity providers');
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

  useEffect(() => {
    if (activeTab !== 'tv' || tvMode !== 'change' || !selectedTvProvider) return;
    setLoadingPlans(true);
    fetchTvVariations(selectedTvProvider)
      .then((plans) => {
        setTvPlans(plans);
        setSelectedTvPlan(null);
      })
      .finally(() => setLoadingPlans(false));
  }, [activeTab, selectedTvProvider, tvMode]);

  useEffect(() => {
    setTvVerification(null);
    setSelectedTvPlan(null);
    setTvRenewAmount('');
    setTvVerifyError(null);
  }, [selectedTvProvider, smartcard]);

  useEffect(() => {
    setElectricityVerification(null);
    setElectricityAmount('');
    setElectricityVerifyError(null);
  }, [selectedElectricityProvider, meterNumber, meterType]);

  useEffect(() => {
    if (meterType === 'postpaid' && electricityVerification?.outstanding_balance) {
      setElectricityAmount(String(electricityVerification.outstanding_balance));
    }
  }, [electricityVerification, meterType]);

  const handleVerifyTv = async () => {
    if (!selectedTvProvider || !smartcard.trim()) {
      setTvVerifyError('Enter a smartcard number');
      setTvVerification(null);
      return;
    }
    setVerifyingTv(true);
    setTvVerifyError(null);
    setTvVerification(null);
    try {
      const result = await verifyUtilityBill({
        category: 'tv',
        provider: selectedTvProvider,
        billers_code: smartcard.trim(),
      });
      setTvVerification(result.verification);
      setTvRenewAmount('');
      if (!result.verification.renewal_amount) {
        setLoadingPlans(true);
        fetchTvVariations(selectedTvProvider)
          .then((plans) => setTvPlans(plans))
          .finally(() => setLoadingPlans(false));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setTvVerification(null);
      setTvVerifyError(message);
    } finally {
      setVerifyingTv(false);
    }
  };

  const handleVerifyElectricity = async () => {
    if (!selectedElectricityProvider || !meterNumber.trim()) {
      setElectricityVerifyError('Enter a meter number');
      setElectricityVerification(null);
      return;
    }
    setVerifyingElectricity(true);
    setElectricityVerifyError(null);
    setElectricityVerification(null);
    try {
      const result = await verifyUtilityBill({
        category: 'electricity',
        provider: selectedElectricityProvider,
        billers_code: meterNumber.trim(),
        meter_type: meterType,
      });
      setElectricityVerification(result.verification);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setElectricityVerification(null);
      setElectricityVerifyError(message);
    } finally {
      setVerifyingElectricity(false);
    }
  };

  const showReceipt = (nextReceipt: UtilityReceipt) => {
    setReceipt(nextReceipt);
    if (nextReceipt.status === 'delivered') fireConfetti();
  };

  const handlePurchase = useCallback(async () => {
    if ((activeTab === 'airtime' || activeTab === 'data') && !phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    const transactionPin = await requestTransactionPin();
    if (!transactionPin) return;

    setPurchaseError(null);
    setLoading(true);
    try {
      if (activeTab === 'airtime') {
        if (!selectedNetwork) {
          toast.error('Please select a network');
          return;
        }
        const value = Number(amount);
        if (!value || value < 50) {
          const message = 'Minimum airtime amount is ₦50';
          setPurchaseError(message);
          toast.error(message);
          return;
        }
        const result = await buyAirtime({
          network: selectedNetwork,
          phone_number: phoneNumber,
          amount: value,
          transaction_pin: transactionPin,
        });
        await refreshAccount?.();
        showReceipt({
          type: 'Airtime',
          amount: String(value),
          recipient: phoneNumber,
          network: selectedNetwork,
          status: (result.status as UtilityReceipt['status']) || 'delivered',
          requestId: result.request_id,
          purchasedAt: new Date().toISOString(),
        });
      } else if (activeTab === 'data') {
        if (!selectedNetwork || !selectedPlan) {
          toast.error('Please select a network and data plan');
          return;
        }
        const result = await buyData({
          network: selectedNetwork,
          phone_number: phoneNumber,
          variation_code: selectedPlan.variation_code,
          amount: selectedPlan.amount,
          transaction_pin: transactionPin,
        });
        await refreshAccount?.();
        showReceipt({
          type: 'Data Bundle',
          amount: String(selectedPlan.amount),
          recipient: phoneNumber,
          network: selectedNetwork,
          plan: selectedPlan.name,
          status: (result.status as UtilityReceipt['status']) || 'delivered',
          requestId: result.request_id,
          purchasedAt: new Date().toISOString(),
        });
      } else if (activeTab === 'tv') {
        if (!tvVerification) {
          toast.error('Please verify smartcard first');
          return;
        }
        const result = await buyTv({
          provider: selectedTvProvider,
          billers_code: smartcard.trim(),
          subscription_type: tvMode,
          variation_code: tvMode === 'change' ? selectedTvPlan?.variation_code : undefined,
          amount: tvPurchaseAmount,
          customer_name: tvVerification.customer_name,
          transaction_pin: transactionPin,
        });
        await refreshAccount?.();
        showReceipt({
          type: 'TV Subscription',
          amount: String(tvPurchaseAmount),
          recipient: smartcard.trim(),
          network: selectedTvProvider,
          plan: tvMode === 'renew' ? tvVerification.current_bouquet : selectedTvPlan?.name,
          customerName: tvVerification.customer_name,
          billersCode: smartcard.trim(),
          status: (result.status as UtilityReceipt['status']) || 'delivered',
          requestId: result.request_id,
          purchasedAt: new Date().toISOString(),
        });
      } else {
        if (!electricityVerification) {
          toast.error('Please verify meter first');
          return;
        }
        const payAmount = meterType === 'postpaid'
          ? Number(electricityVerification.outstanding_balance || 0)
          : electricityValue;
        const result = await buyElectricity({
          provider: selectedElectricityProvider,
          billers_code: meterNumber.trim(),
          meter_type: meterType,
          ...(phoneNumber.trim() ? { phone_number: phoneNumber.trim() } : {}),
          amount: payAmount,
          customer_name: electricityVerification.customer_name,
          transaction_pin: transactionPin,
        });
        await refreshAccount?.();
        showReceipt({
          type: 'Electricity',
          amount: String(payAmount),
          recipient: meterNumber.trim(),
          network: selectedElectricityProvider,
          customerName: electricityVerification.customer_name,
          billersCode: meterNumber.trim(),
          meterType,
          token: result.token,
          units: result.units,
          status: (result.status as UtilityReceipt['status']) || 'delivered',
          requestId: result.request_id,
          purchasedAt: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Purchase failed. Your wallet has been refunded.';
      setPurchaseError(message);
      toast.error(message, { duration: 6000 });
      await refreshAccount?.();
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    amount,
    electricityValue,
    electricityVerification,
    meterNumber,
    meterType,
    phoneNumber,
    refreshAccount,
    selectedElectricityProvider,
    selectedNetwork,
    selectedPlan,
    selectedTvPlan,
    selectedTvProvider,
    smartcard,
    tvMode,
    tvPurchaseAmount,
    tvVerification,
    requestTransactionPin,
  ]);

  const resetPurchase = () => {
    setReceipt(null);
    setPurchaseError(null);
    setAmount('');
    setSelectedPlan(null);
    setTvVerification(null);
    setSelectedTvPlan(null);
    setElectricityVerification(null);
    setElectricityAmount('');
  };

  const purchaseLabel = {
    airtime: 'Buy Airtime',
    data: 'Purchase Bundle',
    tv: 'Pay TV Subscription',
    electricity: 'Pay Electricity Bill',
  }[activeTab];

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
              : `Your ${receipt.type.toLowerCase()} purchase is complete.`}
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
    <div className="utility-purchase utility-purchase-scroll">
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

      <div className="utility-toggle mb-4 p-1 rounded-4 d-flex flex-wrap gap-1" style={{ background: 'rgba(81, 67, 217, 0.12)' }}>
        {([
          ['airtime', BsTelephone, 'Airtime'],
          ['data', BsWifi, 'Data'],
          ['tv', BsTv, 'TV'],
          ['electricity', BsLightningChargeFill, 'Electricity'],
        ] as const).map(([tab, Icon, label]) => (
          <button
            key={tab}
            type="button"
            className={`utility-toggle-btn flex-fill border-0 rounded-3 py-2 px-2 d-flex align-items-center justify-content-center gap-1 ${activeTab === tab ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            <Icon size={16} /> <span className="small">{label}</span>
          </button>
        ))}
      </div>

      {(activeTab === 'airtime' || activeTab === 'data') && (
        <>
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
                <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
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
                        <div className="text-primary fw-bold">{currency}{plan.amount.toLocaleString()}</div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'tv' && (
        <>
          <div className="mb-4">
            <label className="small fw-semibold text-secondary mb-2 d-block">TV Provider</label>
            <div className="row g-2">
              {tvProviders.map((p) => (
                <div key={p.name} className="col-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTvProvider(p.name)}
                    className={`w-100 border rounded-3 py-2 small fw-bold ${selectedTvProvider === p.name ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'bg-light'}`}
                  >
                    {p.label}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="small fw-semibold text-secondary mb-2 d-block">Smartcard Number</label>
            <div className="d-flex gap-2">
              <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light flex-grow-1">
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none"
                  placeholder="e.g. 1212121212"
                  value={smartcard}
                  onChange={(e) => setSmartcard(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-outline-primary rounded-4 px-3" onClick={handleVerifyTv} disabled={verifyingTv}>
                {verifyingTv ? <Spinner animation="border" size="sm" /> : 'Verify'}
              </button>
            </div>
            {tvVerifyError ? (
              <p className="small text-danger mb-0 mt-1">{tvVerifyError}</p>
            ) : null}
          </div>

          {tvVerification && (
            <Alert variant="info" className="mb-3">
              <strong>{tvVerification.customer_name || 'Customer'}</strong>
              {tvVerification.customer_number ? ` · ${tvVerification.customer_number}` : ''}
              {tvVerification.current_bouquet ? ` · ${tvVerification.current_bouquet}` : ''}
              {tvVerification.due_date ? ` · Due ${tvVerification.due_date}` : ''}
              {tvVerification.renewal_amount ? ` · Renewal ${currency}${tvVerification.renewal_amount.toLocaleString()}` : ''}
            </Alert>
          )}

          <div className="utility-toggle mb-3 p-1 rounded-4 d-flex" style={{ background: 'rgba(81, 67, 217, 0.08)' }}>
            <button
              type="button"
              className={`utility-toggle-btn flex-fill border-0 rounded-3 py-2 ${tvMode === 'renew' ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
              onClick={() => setTvMode('renew')}
            >
              Renew Current
            </button>
            <button
              type="button"
              className={`utility-toggle-btn flex-fill border-0 rounded-3 py-2 ${tvMode === 'change' ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
              onClick={() => setTvMode('change')}
            >
              Change Bouquet
            </button>
          </div>

          {tvMode === 'change' && (
            <div className="mb-4">
              <label className="small fw-semibold text-secondary mb-2 d-block">Select Bouquet</label>
              {loadingPlans ? (
                <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
              ) : (
                <div className="row g-3">
                  {tvPlans.map((plan, index) => (
                    <div key={`${plan.variation_code}-${index}`} className="col-6 col-md-4">
                      <button
                        type="button"
                        onClick={() => setSelectedTvPlan(plan)}
                        className={`utility-plan-card w-100 text-start border rounded-4 p-3 h-100 ${selectedTvPlan === plan ? 'border-primary bg-primary bg-opacity-10' : 'bg-light'}`}
                      >
                        <div className="fw-bold mb-2">{plan.name}</div>
                        <div className="text-primary fw-bold">{currency}{plan.amount.toLocaleString()}</div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tvMode === 'renew' && tvVerification && (
            <div className="mb-4">
              <label className="small fw-semibold text-secondary mb-2 d-block">Renewal Amount</label>
              {tvVerification.renewal_amount ? (
                <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light">
                  <span className="fw-bold">{currency}{tvVerification.renewal_amount.toLocaleString()}</span>
                </div>
              ) : (
                <>
                  {loadingPlans ? (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                  ) : tvPlans.length > 0 ? (
                    <div className="mb-3">
                      <p className="small text-muted mb-2">
                         Select your current bouquet or enter the amount manually.
                      </p>
                      <div className="row g-2">
                        {tvPlans.map((plan, index) => {
                          const isSelected = Number(tvRenewAmount) === plan.amount;
                          return (
                            <div key={`${plan.variation_code}-${index}`} className="col-6 col-md-4">
                              <button
                                type="button"
                                onClick={() => setTvRenewAmount(String(plan.amount))}
                                className={`utility-plan-card w-100 text-start border rounded-4 p-3 h-100 ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'bg-light'}`}
                              >
                                <div className="fw-bold mb-1 small">{plan.name}</div>
                                <div className="text-primary fw-bold">{currency}{plan.amount.toLocaleString()}</div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light">
                    <span className="fw-bold me-2">{currency}</span>
                    <input
                      type="number"
                      className="form-control border-0 bg-transparent shadow-none fw-bold"
                      placeholder="Enter renewal amount"
                      value={tvRenewAmount}
                      onChange={(e) => setTvRenewAmount(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'electricity' && (
        <>
          <div className="mb-4">
            <label className="small fw-semibold text-secondary mb-2 d-block">Electricity Provider</label>
            <select
              className="form-select rounded-4 py-3"
              value={selectedElectricityProvider}
              onChange={(e) => setSelectedElectricityProvider(e.target.value)}
            >
              {electricityProviders.map((p) => (
                <option key={p.name} value={p.name}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="utility-toggle mb-3 p-1 rounded-4 d-flex" style={{ background: 'rgba(81, 67, 217, 0.08)' }}>
            <button
              type="button"
              className={`utility-toggle-btn flex-fill border-0 rounded-3 py-2 ${meterType === 'prepaid' ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
              onClick={() => setMeterType('prepaid')}
            >
              Prepaid
            </button>
            <button
              type="button"
              className={`utility-toggle-btn flex-fill border-0 rounded-3 py-2 ${meterType === 'postpaid' ? 'bg-white shadow-sm text-primary fw-bold' : 'bg-transparent text-secondary'}`}
              onClick={() => setMeterType('postpaid')}
            >
              Postpaid
            </button>
          </div>

          <div className="mb-3">
            <label className="small fw-semibold text-secondary mb-2 d-block">Meter Number</label>
            <div className="d-flex gap-2">
              <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light flex-grow-1">
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none"
                  placeholder="Enter meter number"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-outline-primary rounded-4 px-3" onClick={handleVerifyElectricity} disabled={verifyingElectricity}>
                {verifyingElectricity ? <Spinner animation="border" size="sm" /> : 'Verify'}
              </button>
            </div>
            {electricityVerifyError ? (
              <p className="small text-danger mb-0 mt-1">{electricityVerifyError}</p>
            ) : null}
          </div>

          {electricityVerification && (
            <Alert variant="info" className="mb-3">
              <strong>{electricityVerification.customer_name || 'Customer'}</strong>
              {electricityVerification.customer_address ? ` · ${electricityVerification.customer_address}` : ''}
            </Alert>
          )}

          <div className="mb-4">
            <label className="small fw-semibold text-secondary mb-2 d-block">Amount</label>
            <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light">
              <span className="fw-bold me-2">{currency}</span>
              <input
                type="number"
                className="form-control border-0 bg-transparent shadow-none fw-bold"
                placeholder="0.00"
                value={electricityAmount}
                onChange={(e) => setElectricityAmount(e.target.value)}
                readOnly={meterType === 'postpaid'}
              />
            </div>
            {meterType === 'prepaid' && electricityVerification?.minimum_amount ? (
              <p className="small text-muted mt-2 mb-0">
                Minimum: {currency}{electricityVerification.minimum_amount.toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="small fw-semibold text-secondary mb-2 d-block">Phone Number (optional)</label>
            <div className="utility-input-box d-flex align-items-center px-3 rounded-4 bg-light">
              <BsPerson className="text-secondary me-2" />
              <input
                type="tel"
                className="form-control border-0 bg-transparent shadow-none"
                placeholder={profile?.phone_number ? `Uses ${profile.phone_number} if blank` : 'Uses account phone if blank'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        </>
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
          {loading ? <Spinner animation="border" size="sm" /> : purchaseLabel}
        </button>
      </div>

      <style jsx>{`
        .utility-wallet-icon { width: 48px; height: 48px; }
        .utility-input-box { min-height: 56px; }
        .utility-plan-card { transition: border-color 0.15s ease, background 0.15s ease; }
        .utility-purchase-scroll {
          max-height: calc(100dvh - 180px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 24px;
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
      <PinModal />
    </div>
  );
};

export default UtilityPurchase;
