'use client';

import { useState } from 'react';
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

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { apiFetch } = useApi();

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
          {cancelled ? (
            <Badge bg="danger" className="bg-opacity-10 text-danger mb-2 d-block">Cancelled</Badge>
          ) : (
            <Badge bg="success" className="bg-opacity-10 text-success mb-2 d-block">Confirmed</Badge>
          )}
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
                  onClick={() => setShowModal(true)}
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
