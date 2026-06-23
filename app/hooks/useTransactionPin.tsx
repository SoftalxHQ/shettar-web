'use client';

import { useCallback, useRef, useState } from 'react';
import TransactionPinModal from '@/app/components/TransactionPinModal';
import TransactionPinResetModal from '@/app/components/TransactionPinResetModal';

export function useTransactionPin() {
  const [visible, setVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const resolverRef = useRef<((pin: string | null) => void) | null>(null);

  const requestTransactionPin = useCallback((): Promise<string | null> => {
    setVisible(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleSubmit = useCallback((pin: string) => {
    setVisible(false);
    resolverRef.current?.(pin);
    resolverRef.current = null;
  }, []);

  const handleHide = useCallback(() => {
    setVisible(false);
    resolverRef.current?.(null);
    resolverRef.current = null;
  }, []);

  const handleForgotPin = useCallback(() => {
    setVisible(false);
    resolverRef.current?.(null);
    resolverRef.current = null;
    setResetVisible(true);
  }, []);

  const PinModal = useCallback(
    (props?: { title?: string; subtitle?: string }) => (
      <>
        <TransactionPinModal
          show={visible}
          title={props?.title}
          subtitle={props?.subtitle}
          onSubmit={handleSubmit}
          onHide={handleHide}
          onForgotPin={handleForgotPin}
        />
        <TransactionPinResetModal show={resetVisible} onHide={() => setResetVisible(false)} />
      </>
    ),
    [visible, resetVisible, handleSubmit, handleHide, handleForgotPin]
  );

  return { requestTransactionPin, PinModal, openResetPin: () => setResetVisible(true) };
}
