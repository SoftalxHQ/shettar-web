'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import {
  confirmTransactionPinReset,
  requestTransactionPinReset,
} from '@/app/helpers/transaction-pin';

type ResetStep = 'request' | 'code' | 'new' | 'confirm';

type Props = {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

export default function TransactionPinResetModal({ show, onHide, onSuccess }: Props) {
  const [step, setStep] = useState<ResetStep>('request');
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const resetState = useCallback(() => {
    setStep('request');
    setMaskedEmail(null);
    setCode('');
    setDigits(['', '', '', '']);
    setNewPin('');
    setLoading(false);
    setResendCooldown(0);
  }, []);

  useEffect(() => {
    if (!show) {
      resetState();
      return;
    }
    void sendCode();
  }, [show]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!show || step === 'request' || step === 'code') return;
    inputRefs.current[0]?.focus();
  }, [show, step]);

  const sendCode = async () => {
    setLoading(true);
    const result = await requestTransactionPinReset();
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message);
      if (result.code === 'email_not_verified') onHide();
      return;
    }

    setMaskedEmail(result.email ?? null);
    setResendCooldown(60);
    setStep('code');
    toast.success(result.message);
  };

  const resetDigits = () => {
    setDigits(['', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < 3) inputRefs.current[index + 1]?.focus();
    if (index === 3 && char && next.every((d) => d !== '')) {
      void handlePinStepComplete(next.join(''));
    }
  };

  const handlePinStepComplete = async (pinCode: string) => {
    if (step === 'new') {
      setNewPin(pinCode);
      setStep('confirm');
      resetDigits();
      return;
    }

    if (step === 'confirm') {
      if (pinCode !== newPin) {
        toast.error('PIN confirmation does not match');
        setStep('new');
        setNewPin('');
        resetDigits();
        return;
      }

      setLoading(true);
      const result = await confirmTransactionPinReset({
        code: code.trim(),
        pin: pinCode,
        pin_confirmation: pinCode,
      });
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message);
        if (result.code === 'invalid_code' || result.code === 'code_expired') {
          setStep('code');
          setCode('');
        }
        resetDigits();
        return;
      }

      toast.success(result.message);
      onSuccess?.();
      onHide();
    }
  };

  const handleCodeContinue = () => {
    if (code.trim().length < 6) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    setStep('new');
    resetDigits();
  };

  const title =
    step === 'request' || step === 'code'
      ? 'Reset transaction PIN'
      : step === 'new'
        ? 'Create new PIN'
        : 'Confirm new PIN';

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(step === 'request' || step === 'code') && (
          <>
            <p className="text-muted small mb-3">
              {maskedEmail
                ? `Enter the 6-digit code sent to ${maskedEmail}.`
                : 'We will email you a verification code to reset your transaction PIN.'}
            </p>
            {loading && step === 'request' ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mb-3 text-center fs-5 letter-spacing-wide"
                  disabled={loading}
                />
                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={handleCodeContinue}
                  disabled={loading || code.trim().length < 6}
                >
                  Continue
                </Button>
                <div className="text-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-underline"
                    onClick={sendCode}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {(step === 'new' || step === 'confirm') && (
          <>
            <p className="text-muted small mb-4">
              {step === 'new' ? 'Choose a new 4-digit PIN' : 'Re-enter your new PIN'}
            </p>
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
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" size="sm" />
              </div>
            ) : null}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
