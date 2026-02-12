'use client';

import { PasswordFormInput } from '@/app/components';
import { Button, Card, CardHeader, CardBody } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const UpdatePassword = () => {
  const { control, handleSubmit } = useForm();

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title">Update Password</h4>
        <p className="mb-0 text-dark">
          Your current email address is <span className="text-primary">example@gmail.com</span>
        </p>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit(() => { })}>
          <PasswordFormInput
            name="currentPassword"
            label="Current password"
            placeholder="Enter current password"
            containerClass="mb-3 text-dark"
            control={control}
          />

          <PasswordFormInput
            name="newPassword"
            label="Enter new password"
            placeholder="Enter new password"
            containerClass="mb-3 text-dark"
            control={control}
          />

          <PasswordFormInput
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Confirm new password"
            containerClass="mb-3 text-dark"
            control={control}
          />

          <div className="text-end">
            <Button type="submit" variant="primary" className="mb-0">
              Change Password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default UpdatePassword;
