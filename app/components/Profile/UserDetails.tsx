'use client';

import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { BsPencilSquare, BsEnvelope, BsPhone, BsCalendarDate, BsGenderAmbiguous, BsGeoAlt, BsPersonBadge } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import { useLayoutContext } from '@/app/states';

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
  const { account: profile, isAccountLoading: isLoading } = useLayoutContext();

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
        <Link href="/user/settings" className="btn btn-sm btn-primary-soft">
          <BsPencilSquare className="me-1" /> Edit
        </Link>
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
          <Field icon={BsPhone} label="Mobile number" value={profile?.phone_number} />
          <Field icon={BsCalendarDate} label="Date of Birth" value={dob} />
          <Field icon={BsGenderAmbiguous} label="Gender" value={profile?.gender} />
          <Field icon={BsGeoAlt} label="Address" value={profile?.address} />
          <Field icon={BsPersonBadge} label="Account ID" value={profile?.account_unique_id} />
        </Row>
      </CardBody>
    </Card>
  );
};

export default UserDetails;
