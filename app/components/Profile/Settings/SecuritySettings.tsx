'use client';

import { TextFormInput } from '@/app/components';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, CardHeader } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const SecuritySettings = () => {
  const securitySchema = yup.object({
    mobileNo: yup.string().required('Please enter your mobile number').matches(/^[0-9]+$/, 'Must be only digits'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(securitySchema),
    defaultValues: {
      mobileNo: ''
    }
  });

  return (
    <Card className="border">
      <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
        <h4 className="card-header-title mb-0">Security settings</h4>
        <span className="badge bg-warning text-dark">Coming Soon</span>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit(() => { })} className="mb-4">
          <h6>Two-factor authentication</h6>
          <label className="form-label small">Add a phone number to set up two-factor authentication</label>
          <div className="d-flex gap-2 align-items-start">
            <TextFormInput name="mobileNo" placeholder="Enter your mobile number" containerClass="flex-grow-1" control={control} />
            <Button variant="primary" size="sm" type="submit" className="mt-1">
              Send Code
            </Button>
          </div>
        </form>

        <form>
          <h6>Active sessions</h6>
          <p className="mb-2 small">Selecting "Sign out" will sign you out from all devices except this one. This can take up to 10 minutes.</p>
          <Button variant="danger" size="sm" className="mb-0" type="button">
            Sign Out
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default SecuritySettings;
