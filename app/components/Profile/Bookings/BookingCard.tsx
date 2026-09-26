'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { currency } from '@/app/states';
import { BsBuilding, BsCalendar2Check, BsGeoAlt, BsInfoCircle, BsXCircle } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { authorizationHeaders, getStoredToken } from '@/app/helpers/auth';
import { useApi } from '@/app/hooks/useApi';

import Link from 'next/link';
import { businessPublicId, guestPaidAmount, hotelDetailPath, roomServicePath } from '@/app/helpers/bookings';

interface Reservation {
  id: number;
  booking_id: string;
  start_date: string;
  end_date: string;
  total_amount: string | number;
  customer_paid_amount?: string | number | null;
  platform_commission_amount?: string | number | null;
  commission_collection_mode?: string | null;
  payment_method?: string | null;
  cancelled: boolean;
  status?: string; // 'upcoming' | 'active' | 'past' | 'cancelled' — sent by the backend
  occupied?: boolean;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  can_order_room_service?: boolean;
  has_room_service_orders?: boolean;
  can_view_room_service_orders?: boolean;
  room_number?: string;
  payment_method_label?: string;
  booked_at?: string;
  created_at?: string;
  business?: {
    id?: number;
    name: string;
    address: string;
    slug?: string | null;
    business_unique_id?: string;
    check_in: string;
    check_out: string;
    restaurant_enabled?: boolean;
  };
  room?: {
    number?: string;
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
  const hotelPath = hotelDetailPath(business);

  const [showModal, setShowModal] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ cancellation_fee_percentage: number; business_cancellation_credit_percentage: number } | null>(null);
  const { apiFetch } = useApi();

  // Fetch platform config when modal opens to show refund preview
  const closeModal = () => {
    if (loading) return;
    setShowModal(false);
    setAwaitingConfirm(false);
  };

  const openModal = async () => {
    setAwaitingConfirm(false);
    setShowModal(true);
    if (config) return; // already fetched
    try {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
      // Public endpoint — no auth required, won't trigger logout on 401
      const res = await fetch(`${API_URL}/api/v1/cancellation_policy`, { credentials: 'include' });
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
  const guestAlreadyPaidCommission =
    booking.commission_collection_mode === 'on_booking' &&
    Number(booking.platform_commission_amount) > 0 &&
    (booking.payment_method === 'wallet' || booking.payment_method === 'card');

  const refundBreakdown = (() => {
    if (!config) return null;
    const total = Number(total_amount) || 0;
    if (total <= 0) return null;
    const feeRate = guestAlreadyPaidCommission ? 0 : config.cancellation_fee_percentage / 100;
    const remaining = 1 - feeRate;
    const businessCreditRate = config.business_cancellation_credit_percentage / 100;
    const platformFee = +(total * feeRate).toFixed(2);
    const refundable = total - platformFee;
    const businessCredit = +(refundable * businessCreditRate).toFixed(2);
    const customerRefund = +(refundable - businessCredit).toFixed(2);
    const customerPct = +((1 - feeRate) * (1 - businessCreditRate) * 100).toFixed(1);
    const commissionKept = guestAlreadyPaidCommission ? Number(booking.platform_commission_amount) || 0 : 0;
    return { total, platformFee, businessCredit, customerRefund, customerPct, commissionKept, guestAlreadyPaidCommission };
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

  const askToConfirm = () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!finalReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    setAwaitingConfirm(true);
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
          ...authorizationHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cancellation_reason: finalReason })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Booking cancelled successfully');
        setAwaitingConfirm(false);
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
              <li className="nav-item">
                {(booking.room_number || room?.number)
                  ? `Room ${booking.room_number || room?.number}`
                  : 'Room TBA'}
                {' · '}
                {room?.room_type?.name || 'Standard Room'}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-3 mt-md-0 text-md-end">
          <Badge
            bg={statusBadge.bg}
            className={`bg-opacity-10 text-${statusBadge.bg} mb-md-2 d-inline-block d-md-block text-capitalize`}
          >
            {statusBadge.text}
          </Badge>
          <h5 className="mb-0 text-primary d-none d-md-block">{currency}{guestPaidAmount(booking).toLocaleString()}</h5>
        </div>
      </CardHeader>

      <CardBody>
        <Row className="g-3">
          <Col xs={4} md={3}>
            <div className="d-flex align-items-center">
              <BsCalendar2Check className="text-secondary me-2 d-none d-md-inline" />
              <div>
                <span className="small text-secondary d-block">Check-in</span>
                <h6 className="mb-0">{formatDate(start_date)}</h6>
                <span className="small text-muted text-uppercase">{business?.check_in}</span>
              </div>
            </div>
          </Col>
          <Col xs={4} md={3}>
            <div className="d-flex align-items-center">
              <BsCalendar2Check className="text-secondary me-2 d-none d-md-inline" />
              <div>
                <span className="small text-secondary d-block">Check-out</span>
                <h6 className="mb-0">{formatDate(end_date)}</h6>
                <span className="small text-muted text-uppercase">{business?.check_out}</span>
              </div>
            </div>
          </Col>
          <Col xs={4} className="d-md-none text-end">
            <span className="small text-secondary d-block">Total</span>
            <h6 className="mb-0">{currency}{guestPaidAmount(booking).toLocaleString()}</h6>
          </Col>
          <Col xs={12} md={6} className="text-md-end align-self-center">
            <div className="d-flex flex-wrap align-items-center gap-2 justify-content-md-end mt-3 mt-md-0">
              <Link
                href={`/user/bookings/${booking_id}`}
                className="btn btn-outline-primary btn-sm mb-0 py-1 px-2 d-inline-flex align-items-center"
              >
                <BsInfoCircle className="me-1" /> Booking
              </Link>

              {booking.can_order_room_service && businessPublicId(business) && (
                <Link
                  href={roomServicePath(booking_id, {
                    businessUniqueId: businessPublicId(business)!,
                    reservationId: id,
                    roomNumber: booking.room_number || room?.number || '',
                  })}
                  className="btn btn-primary btn-sm mb-0 py-1 px-2 d-inline-flex align-items-center"
                >
                  Room service
                </Link>
              )}

              {!booking.can_order_room_service &&
                booking.has_room_service_orders &&
                businessPublicId(business) && (
                <Link
                  href={roomServicePath(booking_id, {
                    businessUniqueId: businessPublicId(business)!,
                    reservationId: id,
                    roomNumber: booking.room_number || room?.number || '',
                    historyOnly: true,
                  })}
                  className="btn btn-outline-primary btn-sm mb-0 py-1 px-2 d-inline-flex align-items-center"
                >
                  View orders
                </Link>
              )}

              {hotelPath && (
                <Link href={hotelPath} className="btn btn-outline-secondary btn-sm mb-0 py-1 px-2 d-inline-flex align-items-center">
                  Hotel
                </Link>
              )}

              {!cancelled && isEligible() && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm mb-0 py-1 px-2 d-inline-flex align-items-center w-auto"
                  onClick={openModal}
                >
                  <BsXCircle className="me-1" /> Cancel
                </button>
              )}
            </div>
          </Col>
        </Row>
      </CardBody>

      {/* Cancellation Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton={!loading}>
          <Modal.Title className="h5">{awaitingConfirm ? 'Confirm cancellation' : 'Cancel Reservation'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {awaitingConfirm ? (
            <div>
              <p className="mb-2">
                Cancel this stay at <strong>{business?.name || 'this hotel'}</strong>?
              </p>
              {refundBreakdown && (
                <p className="small text-secondary mb-0">
                  You will receive {currency}{refundBreakdown.customerRefund.toLocaleString()}.
                </p>
              )}
            </div>
          ) : (
          <>
          <p className="small text-secondary mb-3">
            Please select a reason for cancelling your stay at <strong>{business?.name}</strong>.
          </p>

          {/* Refund breakdown */}
          {refundBreakdown ? (
            <div className="bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded p-3 mb-3">
              <p className="small fw-bold mb-2">Refund Breakdown</p>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Room amount</span>
                <span>{currency}{refundBreakdown.total.toLocaleString()}</span>
              </div>
              {refundBreakdown.guestAlreadyPaidCommission ? (
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Fee</span>
                  <span>{currency}{refundBreakdown.commissionKept.toLocaleString()}</span>
                </div>
              ) : (
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Platform cancellation fee ({config?.cancellation_fee_percentage}%)</span>
                  <span className="text-danger">−{currency}{refundBreakdown.platformFee.toLocaleString()}</span>
                </div>
              )}
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Business retention</span>
                <span className="text-secondary">−{currency}{refundBreakdown.businessCredit.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small fw-bold border-top pt-2 mt-1">
                <span className="text-success">You will receive ({refundBreakdown.customerPct}%)</span>
                <span className="text-success">{currency}{refundBreakdown.customerRefund.toLocaleString()}</span>
              </div>
              {!refundBreakdown.guestAlreadyPaidCommission && (
                <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.7rem' }}>
                  Refund will be credited to your Shettar wallet.
                </p>
              )}
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
          </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          {awaitingConfirm ? (
            <>
              <Button variant="link" size="sm" className="text-secondary" onClick={() => setAwaitingConfirm(false)} disabled={loading}>
                Go back
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancel} disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Yes, cancel booking'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="link" size="sm" className="text-secondary" onClick={closeModal} disabled={loading}>
                Close
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={askToConfirm}
                disabled={loading || (selectedReason === 'Other' && !customReason.trim())}
              >
                Confirm Cancellation
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default BookingCard;
