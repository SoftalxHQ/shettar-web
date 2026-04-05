'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { currency } from '@/app/states';
import { BsBuilding, BsCalendar2Check, BsGeoAlt, BsInfoCircle, BsXCircle } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';

import Link from 'next/link';

interface Reservation {
  id: number;
  booking_id: string;
  start_date: string;
  end_date: string;
  total_amount: string | number;
  cancelled: boolean;
  status?: string; // 'upcoming' | 'active' | 'past' | 'cancelled' — sent by the backend
  business?: {
    name: string;
    address: string;
    slug: string;
    check_in: string;
    check_out: string;
  };
  room?: {
    room_type: {
      name: string;
    }
  };
}

interface BookingCardProps {
  booking: Reservation;
  onSuccess?: () => void;
}

const getStatusBadge = (booking: Reservation) => {
  if (booking.cancelled) return { bg: 'danger', text: 'Cancelled' };

  switch (booking.status) {
    case 'active': return { bg: 'primary', text: 'Active' };
    case 'past': return { bg: 'secondary', text: 'Completed' };
    case 'upcoming': return { bg: 'success', text: 'Upcoming' };
    default: return { bg: 'success', text: 'Confirmed' }; // fallback
  }
};


const CANCELLATION_REASONS = [
  "Change of plans",
  "Found a better deal",
  "Personal emergency",
  "Travel dates changed",
  "Hotel location not ideal",
  "Health issues",
  "Other"
];

const BookingCard = ({ booking, onSuccess }: BookingCardProps) => {
  const { id, booking_id, start_date, end_date, cancelled, business, room, total_amount } = booking;
  const statusBadge = getStatusBadge(booking);

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ cancellation_fee_percentage: number; business_cancellation_credit_percentage: number } | null>(null);
  const { apiFetch } = useApi();

  // Fetch platform config when modal opens to show refund preview
  const openModal = async () => {
    setShowModal(true);
    if (config) return; // already fetched
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      // Public endpoint — no auth required, won't trigger logout on 401
      const res = await fetch(`${API_URL}/api/v1/cancellation_policy`);
      if (res.ok) {
        const data = await res.json();
        setConfig({
          cancellation_fee_percentage: data.cancellation_fee_percentage ?? 10,
          business_cancellation_credit_percentage: data.business_cancellation_credit_percentage ?? 22.22,
        });
      }
    } catch { /* silent — modal still works without preview */ }
  };

  // Calculate the customer refund amount
  const refundBreakdown = (() => {
    if (!config) return null;
    const total = Number(total_amount) || 0;
    if (total <= 0) return null;
    const feeRate = config.cancellation_fee_percentage / 100;
    const remaining = 1 - feeRate;
    const businessCreditRate = config.business_cancellation_credit_percentage / 100;
    const platformFee = +(total * feeRate).toFixed(2);
    const refundable = total - platformFee;
    const businessCredit = +(refundable * businessCreditRate).toFixed(2);
    const customerRefund = +(refundable - businessCredit).toFixed(2);
    const customerPct = +((1 - feeRate) * (1 - businessCreditRate) * 100).toFixed(1);
    return { total, platformFee, businessCredit, customerRefund, customerPct };
  })();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isEligible = () => {
    if (cancelled) return false;

    // Eligibility: not yet ended
    const end = new Date(end_date);
    const [h, m] = (business?.check_out || '11:00').split(':').map(Number);
    end.setHours(h, m, 0, 0);

    return new Date() < end;
  };

  const handleCancel = async () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!finalReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      const token = getStoredToken();
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      const response = await apiFetch(`${API_URL}/api/v1/reservations/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cancellation_reason: finalReason })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Booking cancelled successfully');
        setShowModal(false);
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = data.error?.[0]?.message || data.error || 'Failed to cancel booking';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border mb-4 shadow-sm">
      <CardHeader className="border-bottom d-md-flex justify-content-md-between align-items-center bg-transparent">
        <div className="d-flex align-items-center">
          <div className="icon-lg bg-primary bg-opacity-10 text-primary rounded-circle flex-shrink-0 flex-centered">
            <BsBuilding size={24} />
          </div>

          <div className="ms-3">
            <h6 className="card-title mb-1">{business?.name || 'Hotel Name'}</h6>
            <div className="small text-secondary d-flex align-items-center">
              <BsGeoAlt className="me-1" /> {business?.address || 'Address not available'}
            </div>
            <ul className="nav nav-divider small mt-1">
              <li className="nav-item">Booking ID: <span className="text-dark fw-bold">{booking_id}</span></li>
              <li className="nav-item">{room?.room_type?.name || 'Standard Room'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-3 mt-md-0 text-md-end">
          <Badge
            bg={statusBadge.bg}
            className={`bg-opacity-10 text-${statusBadge.bg} mb-2 d-block text-capitalize`}
          >
            {statusBadge.text}
          </Badge>
          <h5 className="mb-0 text-primary">{currency}{Number(total_amount).toLocaleString()}</h5>
        </div>
      </CardHeader>

      <CardBody>
        <Row className="g-3">
          <Col sm={6} md={3}>
            <div className="d-flex align-items-center">
              <BsCalendar2Check className="text-secondary me-2" />
              <div>
                <span className="small text-secondary d-block">Check-in</span>
                <h6 className="mb-0">{formatDate(start_date)}</h6>
                <span className="small text-muted text-uppercase">{business?.check_in}</span>
              </div>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="d-flex align-items-center">
              <BsCalendar2Check className="text-secondary me-2" />
              <div>
                <span className="small text-secondary d-block">Check-out</span>
                <h6 className="mb-0">{formatDate(end_date)}</h6>
                <span className="small text-muted text-uppercase">{business?.check_out}</span>
              </div>
            </div>
          </Col>
          <Col sm={12} md={6} className="text-md-end align-self-center">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end mt-3 mt-md-0">
              {business?.slug && (
                <Link href={`/hotel/${business.slug}`} passHref>
                  <Button variant="outline-primary" size="sm" className="mb-0">
                    <BsInfoCircle className="me-1" /> View Details
                  </Button>
                </Link>
              )}

              {!cancelled && isEligible() && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="mb-0"
                  onClick={openModal}
                >
                  <BsXCircle className="me-1" /> Cancel Booking
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </CardBody>

      {/* Cancellation Modal */}
      <Modal show={showModal} onHide={() => !loading && setShowModal(false)} centered>
        <Modal.Header closeButton={!loading}>
          <Modal.Title className="h5">Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-secondary mb-3">
            Please select a reason for cancelling your stay at <strong>{business?.name}</strong>.
          </p>

          {/* Refund breakdown */}
          {refundBreakdown ? (
            <div className="bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded p-3 mb-3">
              <p className="small fw-bold mb-2">Refund Breakdown</p>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Booking total</span>
                <span>{currency}{refundBreakdown.total.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Platform cancellation fee ({config?.cancellation_fee_percentage}%)</span>
                <span className="text-danger">−{currency}{refundBreakdown.platformFee.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Business retention</span>
                <span className="text-secondary">−{currency}{refundBreakdown.businessCredit.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small fw-bold border-top pt-2 mt-1">
                <span className="text-success">You will receive ({refundBreakdown.customerPct}%)</span>
                <span className="text-success">{currency}{refundBreakdown.customerRefund.toLocaleString()}</span>
              </div>
              <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.7rem' }}>
                Refund will be credited to your Shettar wallet.
              </p>
            </div>
          ) : (
            <div className="bg-light rounded p-2 mb-3 text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="small text-muted">Loading refund details…</span>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Why are you cancelling?</Form.Label>
            <Form.Select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={loading}
              className="form-select-sm"
            >
              {CANCELLATION_REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedReason === 'Other' && (
            <Form.Group>
              <Form.Label className="small fw-bold">Please specify</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={loading}
                className="form-control-sm"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="link" size="sm" className="text-secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Close
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            disabled={loading || (selectedReason === 'Other' && !customReason.trim())}
          >
            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default BookingCard;
