'use client';

import { useRef, useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { BsDownload, BsShare } from 'react-icons/bs';
import toast from 'react-hot-toast';
import UtilityReceiptCard, { type UtilityReceipt } from './UtilityReceiptCard';
import {
  downloadReceiptPdf,
  downloadReceiptPng,
  shareReceiptPng,
} from '@/app/helpers/receipt-export';
import { resolveReceiptReference } from '@/app/helpers/utility-receipt';

type UtilityReceiptModalProps = {
  receipt: UtilityReceipt | null;
  onClose: () => void;
};

const UtilityReceiptModal = ({ receipt, onClose }: UtilityReceiptModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'share' | 'png' | 'pdf' | null>(null);

  const runExport = async (
    action: 'share' | 'png' | 'pdf',
    fn: (el: HTMLElement) => Promise<void | 'shared' | 'downloaded'>
  ) => {
    if (exporting) return;

    const el = cardRef.current;
    if (!el) {
      toast.error('Receipt is still loading. Please try again.');
      return;
    }

    setExporting(action);
    try {
      const result = await fn(el);
      if (action === 'share') {
        toast.success(result === 'shared' ? 'Receipt shared' : 'Receipt downloaded');
      } else if (action === 'png') {
        toast.success('Receipt image downloaded');
      } else {
        toast.success('Receipt PDF downloaded');
      }
    } catch (error) {
      console.error('Receipt export failed:', error);
      toast.error('Could not export receipt. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const reference = receipt ? resolveReceiptReference(receipt) : undefined;

  return (
    <Modal show={Boolean(receipt)} onHide={onClose} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Transaction Receipt</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-md-4">
        {receipt ? (
          <UtilityReceiptCard ref={cardRef} receipt={receipt} hideInlineActions />
        ) : null}
      </Modal.Body>
      {receipt ? (
        <Modal.Footer className="d-flex flex-wrap gap-2 justify-content-between">
          <Button variant="outline-secondary" onClick={onClose}>
            Close
          </Button>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => runExport('share', (el) => shareReceiptPng(el, reference))}
            >
              {exporting === 'share' ? <Spinner size="sm" className="me-2" /> : <BsShare className="me-2" />}
              Share
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => runExport('png', (el) => downloadReceiptPng(el, reference))}
            >
              {exporting === 'png' ? <Spinner size="sm" className="me-2" /> : <BsDownload className="me-2" />}
              Download Image
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => runExport('pdf', (el) => downloadReceiptPdf(el, reference))}
            >
              {exporting === 'pdf' ? <Spinner size="sm" className="me-2" /> : <BsDownload className="me-2" />}
              Download PDF
            </Button>
          </div>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
};

export default UtilityReceiptModal;
