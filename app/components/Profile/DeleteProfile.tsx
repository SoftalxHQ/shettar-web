'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useApi } from '@/app/hooks/useApi';
import { getStoredToken } from '@/app/helpers/auth';

const DeleteProfile = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const { apiFetch } = useApi();

  const handlePreDelete = () => {
    if (!isChecked) {
      toast.error('Please confirm you want to delete your account by checking the box.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setIsDeleting(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/accounts`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        toast.success('Your account has been deleted successfully.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Forces full reload to clear any caching/context state
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || errorData.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('An error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border">
        <CardHeader className="border-bottom">
          <h4 className="card-header-title">Delete Account</h4>
        </CardHeader>

        <CardBody>
          <h6>Before you go...</h6>
          <ul className="small">
            <li>
              Take a backup of your data <Link href="#" className="text-primary">Here</Link>{' '}
            </li>
            <li>If you delete your account, you will lose your all data.</li>
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
              disabled={!isChecked || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete my account'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
        </Modal.Header>
        <Modal.Body className="text-center pb-4 px-4">
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-exclamation-triangle-fill fs-3"></i>
          </div>
          <h4 className="mb-2">Are you absolutely sure?</h4>
          <p className="text-secondary mb-0">
            This action cannot be undone. All of your personal data, reviews, and bookings will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
          <Button variant="light" onClick={() => setShowConfirmModal(false)}>
            Cancel, keep account
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Yes, delete permanently
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteProfile;
