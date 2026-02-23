'use client';

import { Card, CardBody, CardHeader, Col, Row, Image } from 'react-bootstrap';
import { BsPencilSquare, BsEnvelope, BsPhone, BsCalendarDate, BsGenderAmbiguous, BsGeoAlt, BsPersonBadge } from 'react-icons/bs';
import Link from 'next/link';
import { useLayoutContext } from '@/app/states';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { resendPhoneVerification, verifyPhone } from '@/app/helpers/auth';
import { Button, Modal, Form } from 'react-bootstrap';

const Field = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => (
  <Col md={6}>
    <div className="d-flex align-items-center mb-3">
      <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
        <Icon size={14} />
      </div>
      <div>
        <p className="small mb-0 text-secondary">{label}</p>
        <h6 className="mb-0">{value || <span className="text-muted fst-italic">Not set</span>}</h6>
      </div>
    </div>
  </Col>
);

// UserDetailsSkeleton is not defined in the provided context, assuming it's a placeholder or needs to be added.
// For now, I'll define a minimal placeholder to make the code syntactically correct.
const UserDetailsSkeleton = () => (
  <Card className="border">
    <CardBody className="p-4">
      <div className="placeholder-glow">
        <span className="placeholder col-12 d-block mb-3" />
        <span className="placeholder col-8 d-block" />
      </div>
    </CardBody>
  </Card>
);

const UserDetails = () => {
  const { account: profile, isAccountLoading: isLoading, refreshAccount } = useLayoutContext();

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSendPhoneCode = async () => {
    setIsSendingCode(true);
    const toastId = toast.loading('Sending verification code...');
    try {
      const result = await resendPhoneVerification();
      if (result.ok) {
        toast.success(result.message, { id: toastId });
        setShowVerifyModal(true);
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!verificationCode) return toast.error('Please enter the code');
    setIsVerifying(true);
    const toastId = toast.loading('Verifying code...');
    try {
      const result = await verifyPhone(verificationCode);
      if (result.ok) {
        toast.success(result.message, { id: toastId });
        setShowVerifyModal(false);
        refreshAccount();
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <UserDetailsSkeleton />;
  }

  if (!profile) {
    return (
      <Card className="border">
        <CardBody className="p-4 text-center">
          <p className="text-secondary mb-0">Please sign in to view your profile details.</p>
        </CardBody>
      </Card>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const dob = profile?.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Card className="border">
      <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
        <h4 className="card-header-title mb-0">Personal Information</h4>
      </CardHeader>

      <CardBody>
        <div className="d-flex align-items-center mb-4 pb-4 border-bottom">
          <div className="avatar avatar-xl me-4 flex-shrink-0">
            {profile?.avatar_url ? (
              <Image
                className="avatar-img rounded-circle border border-primary border-3 shadow"
                src={profile.avatar_url}
                alt="avatar"
                width={80}
                height={80}
              />
            ) : (
              <div
                className="avatar-img rounded-circle border border-primary border-3 shadow bg-primary-soft d-flex align-items-center justify-content-center"
                style={{ width: 80, height: 80 }}
              >
                <span className="h4 text-primary mb-0">
                  {profile?.first_name?.charAt(0) ?? '?'}
                </span>
              </div>
            )}
          </div>
          <div>
            <h5 className="mb-1">{fullName}</h5>
            <span className={`badge ${profile?.email_verified ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
              {profile?.email_verified ? '✓ Verified Member' : '⚠ Email not verified'}
            </span>
          </div>
        </div>

        <Row className="g-4">
          <Field icon={BsEnvelope} label="Email address" value={profile?.email} />

          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <div className="icon-sm bg-light text-primary rounded-circle me-3 flex-centered">
                <BsPhone size={14} />
              </div>
              <div className="flex-grow-1">
                <p className="small mb-0 text-secondary">Mobile number</p>
                <h6 className="mb-0">{profile?.phone_number || <span className="text-muted fst-italic">Not set</span>}</h6>

                {profile?.phone_number && (
                  <div className="mt-1">
                    {profile?.phone_verified ? (
                      <span className="badge bg-success bg-opacity-10 text-success">
                        ✓ Verified Profile
                      </span>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-warning bg-opacity-10 text-warning">
                          ⚠ Unverified phone
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-underline text-primary"
                          style={{ fontSize: '0.8rem' }}
                          onClick={handleSendPhoneCode}
                          disabled={isSendingCode}
                        >
                          {isSendingCode ? 'Sending...' : 'Verify Now'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Field icon={BsCalendarDate} label="Date of Birth" value={dob} />
          <Field icon={BsGenderAmbiguous} label="Gender" value={profile?.gender} />
          <Field icon={BsGeoAlt} label="Address" value={profile?.address} />
          <Field icon={BsPersonBadge} label="Account ID" value={profile?.account_unique_id} />
        </Row>

        {(profile?.emer_first_name || profile?.emer_last_name || profile?.emer_phone_number) && (
          <div className="mt-4 pt-4 border-top">
            <h6 className="mb-3">Next of Kin Details</h6>
            <Row className="g-4">
              <Field
                icon={BsPersonBadge}
                label="Full Name"
                value={`${profile?.emer_first_name ?? ''} ${profile?.emer_last_name ?? ''}`.trim()}
              />
              <Field
                icon={BsPhone}
                label="Phone Number"
                value={profile?.emer_phone_number}
              />
            </Row>
          </div>
        )}
      </CardBody>

      {/* Phone Verification Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Verify Phone Number</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-secondary mb-4">
            We sent a 6-digit verification code to your phone number <strong>{profile?.phone_number}</strong>.
            Please enter it below to verify your phone number.
          </p>
          <div className="mb-3">
            <label className="form-label">Verification Code</label>
            <Form.Control
              type="text"
              size="lg"
              placeholder="e.g. 123456"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            className="w-100"
            size="lg"
            onClick={handleVerifyPhoneCode}
            disabled={isVerifying || verificationCode.length < 6}
          >
            {isVerifying ? 'Verifying...' : 'Verify Phone'}
          </Button>
          <div className="text-center mt-3">
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-underline text-secondary"
              onClick={handleSendPhoneCode}
              disabled={isSendingCode}
            >
              {isSendingCode ? 'Sending...' : "Didn't receive code? Resend"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </Card >
  );
};

export default UserDetails;
