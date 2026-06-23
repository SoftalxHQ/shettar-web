'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { isTransactionPinSet, setTransactionPin } from '@/app/helpers/transaction-pin';

type Props = {
  show: boolean;
  title?: string;
  subtitle?: string;
  onSubmit: (pin: string) => void;
  onHide: () => void;
  allowSetup?: boolean;
};

type SetupStep = 'password' | 'new_pin' | 'confirm_pin';

export default function TransactionPinModal({
  show,
  title = 'Enter transaction PIN',
  subtitle = 'Confirm this wallet payment with your 4-digit PIN',
  onSubmit,
  onHide,
  allowSetup = true,
}: Props) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [setupStep, setSetupStep] = useState<SetupStep>('password');
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!show) return;

    setDigits(['', '', '', '']);
    setPassword('');
    setNewPin('');
    setError(null);
    setSetupStep('password');
    setLoading(true);

    isTransactionPinSet()
      .then((set) => setNeedsSetup(allowSetup && !set))
      .finally(() => setLoading(false));
  }, [show, allowSetup]);

  useEffect(() => {
    if (!show || loading || (needsSetup && setupStep === 'password')) return;
    inputRefs.current[0]?.focus();
  }, [show, loading, needsSetup, setupStep]);

  const resetDigits = () => {
    setDigits(['', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError(null);

    if (char && index < 3) inputRefs.current[index + 1]?.focus();
    if (index === 3 && char && next.every((d) => d !== '')) {
      void handlePinComplete(next.join(''));
    }
  };

  const handlePinComplete = async (pinCode: string) => {
    if (needsSetup) {
      if (setupStep === 'new_pin') {
        setNewPin(pinCode);
        setSetupStep('confirm_pin');
        resetDigits();
        return;
      }

      if (setupStep === 'confirm_pin') {
        if (pinCode !== newPin) {
          setError('PIN confirmation does not match');
          setSetupStep('new_pin');
          setNewPin('');
          resetDigits();
          return;
        }

        setLoading(true);
        const result = await setTransactionPin({
          password,
          pin: pinCode,
          pin_confirmation: pinCode,
        });
        setLoading(false);

        if (!result.ok) {
          setError(result.message);
          if (result.code === 'invalid_password') {
            setSetupStep('password');
            setPassword('');
          } else {
            setSetupStep('new_pin');
            setNewPin('');
          }
          resetDigits();
          return;
        }

        onSubmit(pinCode);
        return;
      }
    }

    onSubmit(pinCode);
  };

  const handlePasswordContinue = () => {
    if (!password.trim()) {
      setError('Enter your account password');
      return;
    }
    setError(null);
    setSetupStep('new_pin');
    resetDigits();
  };

  const currentTitle =
    needsSetup && setupStep === 'password'
      ? 'Set transaction PIN'
      : needsSetup && setupStep === 'new_pin'
        ? 'Create 4-digit PIN'
        : needsSetup && setupStep === 'confirm_pin'
          ? 'Confirm PIN'
          : title;

  const currentSubtitle =
    needsSetup && setupStep === 'password'
      ? 'Verify your password before creating a transaction PIN'
      : needsSetup && setupStep === 'new_pin'
        ? 'Choose a PIN for wallet payments'
        : needsSetup && setupStep === 'confirm_pin'
          ? 'Re-enter your new PIN'
          : subtitle;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{currentTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small mb-4">{currentSubtitle}</p>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : needsSetup && setupStep === 'password' ? (
          <>
            <Form.Control
              type="password"
              placeholder="Account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3"
            />
            {error ? <p className="text-danger small">{error}</p> : null}
            <Button variant="primary" className="w-100" onClick={handlePasswordContinue}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-center gap-2 mb-3">
              {digits.map((digit, index) => (
                <Form.Control
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className="text-center fs-4 fw-bold"
                  style={{ width: 56, height: 56 }}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digits[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  disabled={loading}
                />
              ))}
            </div>
            {error ? <p className="text-danger small text-center mb-0">{error}</p> : null}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
