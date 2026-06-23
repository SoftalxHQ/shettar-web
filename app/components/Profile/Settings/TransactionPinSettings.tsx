'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader } from 'react-bootstrap';
import toast from 'react-hot-toast';
import TransactionPinModal from '@/app/components/TransactionPinModal';
import { changeTransactionPin, isTransactionPinSet } from '@/app/helpers/transaction-pin';

const TransactionPinSettings = () => {
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeStep, setChangeStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    isTransactionPinSet().then(setPinSet);
  }, []);

  const refreshPinStatus = async () => {
    setPinSet(await isTransactionPinSet());
  };

  const handleSetupComplete = async () => {
    await refreshPinStatus();
    setShowSetupModal(false);
    toast.success('Transaction PIN set');
  };

  const handleChangeSubmit = async (pinCode: string) => {
    if (changeStep === 'current') {
      setCurrentPin(pinCode);
      setChangeStep('new');
      return;
    }

    if (changeStep === 'new') {
      setNewPin(pinCode);
      setChangeStep('confirm');
      return;
    }

    if (pinCode !== newPin) {
      toast.error('PIN confirmation does not match');
      setChangeStep('new');
      setNewPin('');
      return;
    }

    const result = await changeTransactionPin({
      current_pin: currentPin,
      pin: pinCode,
      pin_confirmation: pinCode,
    });

    if (!result.ok) {
      toast.error(result.message);
      if (result.code === 'invalid_pin') {
        setChangeStep('current');
        setCurrentPin('');
      }
      return;
    }

    toast.success('Transaction PIN updated');
    setShowChangeModal(false);
    setChangeStep('current');
    setCurrentPin('');
    setNewPin('');
    await refreshPinStatus();
  };

  const openChangeModal = () => {
    setChangeStep('current');
    setCurrentPin('');
    setNewPin('');
    setShowChangeModal(true);
  };

  const changeTitle =
    changeStep === 'current' ? 'Enter current PIN' : changeStep === 'new' ? 'Enter new PIN' : 'Confirm new PIN';

  return (
    <>
      <Card className="border">
        <CardHeader className="border-bottom">
          <h4 className="card-header-title mb-0">Transaction PIN</h4>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            Required for wallet payments such as utility bills and bookings. Top-ups do not require your PIN.
          </p>
          {pinSet === null ? (
            <p className="text-muted small mb-0">Loading PIN status…</p>
          ) : pinSet ? (
            <Button variant="outline-primary" size="sm" onClick={openChangeModal}>
              Change transaction PIN
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setShowSetupModal(true)}>
              Set transaction PIN
            </Button>
          )}
        </CardBody>
      </Card>

      <TransactionPinModal
        show={showSetupModal}
        title="Set transaction PIN"
        subtitle="Create a 4-digit PIN for wallet payments"
        onSubmit={handleSetupComplete}
        onHide={() => setShowSetupModal(false)}
      />

      <TransactionPinModal
        show={showChangeModal}
        key={`change-${changeStep}`}
        title={changeTitle}
        subtitle="Use your 4-digit transaction PIN"
        onSubmit={handleChangeSubmit}
        onHide={() => setShowChangeModal(false)}
        allowSetup={false}
      />
    </>
  );
};

export default TransactionPinSettings;
