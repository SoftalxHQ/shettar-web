'use client';

import { Card, CardBody, CardHeader, Button } from 'react-bootstrap';
import Link from 'next/link';

const DeleteProfile = () => {
  return (
    <Card className="border">
      <CardHeader className="border-bottom text-dark">
        <h4 className="card-header-title">Delete Account</h4>
      </CardHeader>

      <CardBody>
        <h6 className="text-dark">Before you go...</h6>
        <ul className="text-dark small">
          <li>
            Take a backup of your data <Link href="#" className="text-primary">Here</Link>{' '}
          </li>
          <li>If you delete your account, you will lose your all data.</li>
        </ul>
        <div className="form-check form-check-md my-4 flex-centered justify-content-start">
          <input className="form-check-input mt-0" type="checkbox" id="deleteaccountCheck" />
          <label className="form-check-label text-dark ms-2 mt-0" htmlFor="deleteaccountCheck">
            Yes, I'd like to delete my account
          </label>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/user/profile" className="btn btn-success-soft btn-sm mb-0">
            Keep my account
          </Link>
          <Button variant="danger" size="sm" className="mb-0">
            Delete my account
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default DeleteProfile;
