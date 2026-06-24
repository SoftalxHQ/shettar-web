'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Modal, Form } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';
import { getStoredToken } from '@/app/helpers/auth';
import {
  ACCOUNT_DELETION_REASONS,
  type AccountDeletionReason,
  cancelAccountDeletion,
  formatDeletionCountdown,
  scheduleAccountDeletion,
} from '@/app/helpers/account-deletion';

const DeleteProfile = () => {
  const { account, refreshAccount } = useLayoutContext();
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<AccountDeletionReason>('not_using');
  const [reasonDetail, setReasonDetail] = useState('');
  const [countdown, setCountdown] = useState('00:00:00');

  const deletionPending = !!account?.deletion_pending;

  useEffect(() => {
    if (!deletionPending || !account?.deletion_execute_at) return;

    const updateCountdown = () => {
      setCountdown(formatDeletionCountdown(account.deletion_execute_at));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [account?.deletion_execute_at, deletionPending]);

  const handlePreDelete = () => {
    if (!isChecked) {
      toast.error('Please confirm you want to delete your account by checking the box.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmContinue = () => {
    setShowConfirmModal(false);
    setShowReasonModal(true);
  };

  const handleScheduleDeletion = async () => {
    if (selectedReason === 'other' && reasonDetail.trim().length < 3) {
      toast.error('Please tell us why you are leaving.');
      return;
    }

    const token = getStoredToken();
    if (!token) {
      toast.error('You are not signed in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await scheduleAccountDeletion(token, {
        reason: selectedReason,
        reasonDetail: reasonDetail.trim(),
      });

      if (result.ok) {
        toast.success(result.message);
        setShowReasonModal(false);
        setReasonDetail('');
        await refreshAccount();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDeletion = async () => {
    const token = getStoredToken();
    if (!token) {
      toast.error('You are not signed in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await cancelAccountDeletion(token);
      if (result.ok) {
        toast.success(result.message);
        await refreshAccount();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border">
        <CardHeader className="border-bottom">
          <h4 className="card-header-title">Delete Account</h4>
        </CardHeader>

        <CardBody>
          {deletionPending ? (
            <>
              <h6 className="text-danger">Account deletion scheduled</h6>
              <p className="small mb-2">
                Your account will be permanently deleted in <strong>{countdown}</strong>.
                After that, your data cannot be recovered.
              </p>
              <p className="small text-secondary mb-4">
                You can restore your account anytime before the countdown ends.
              </p>
              <Button
                variant="success"
                size="sm"
                onClick={handleCancelDeletion}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Restoring...' : 'Cancel deletion and restore account'}
              </Button>
            </>
          ) : (
            <>
              <h6>Before you go...</h6>
              <ul className="small">
                <li>
                  Take a backup of your data{' '}
                  <Link href="/user/data-export" className="text-primary">
                    here
                  </Link>
                </li>
                <li>Deletion is scheduled for 24 hours after you confirm. You can cancel during that window.</li>
                <li>After 24 hours, your account and data are permanently removed and cannot be recovered.</li>
              </ul>
              <div className="form-check form-check-md my-4 flex-centered justify-content-start">
                <input
                  className="form-check-input mt-0"
                  type="checkbox"
                  id="deleteaccountCheck"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <label className="form-check-label ms-2 mt-0" htmlFor="deleteaccountCheck">
                  Yes, I'd like to delete my account
                </label>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Link href="/user/profile" className="btn btn-success-soft btn-sm mb-0">
                  Keep my account
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="mb-0"
                  onClick={handlePreDelete}
                  disabled={!isChecked || isSubmitting}
                >
                  Delete my account
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0" />
        <Modal.Body className="text-center pb-4 px-4">
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-exclamation-triangle-fill fs-3"></i>
          </div>
          <h4 className="mb-2">Are you absolutely sure?</h4>
          <p className="text-secondary mb-0">
            Your account will be scheduled for deletion in 24 hours. You can cancel anytime before then.
            After the grace period, all of your data will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
          <Button variant="light" onClick={() => setShowConfirmModal(false)}>
            Cancel, keep account
          </Button>
          <Button variant="danger" onClick={handleConfirmContinue}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReasonModal} onHide={() => !isSubmitting && setShowReasonModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Tell us why you&apos;re leaving</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {ACCOUNT_DELETION_REASONS.map((option) => (
              <Form.Check
                key={option.value}
                type="radio"
                id={`delete-reason-${option.value}`}
                name="deletionReason"
                label={option.label}
                value={option.value}
                checked={selectedReason === option.value}
                onChange={() => setSelectedReason(option.value)}
                className="mb-2"
              />
            ))}
            {selectedReason === 'other' && (
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please share your reason"
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                className="mt-2"
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowReasonModal(false)} disabled={isSubmitting}>
            Back
          </Button>
          <Button variant="danger" onClick={handleScheduleDeletion} disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule deletion'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteProfile;
