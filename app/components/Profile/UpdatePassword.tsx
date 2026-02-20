'use client';

import { PasswordFormInput } from '@/app/components';
import { Button, Card, CardHeader, CardBody } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { changeAccountPassword } from '@/app/hooks/useAccountProfile';
import { useLayoutContext } from '@/app/states';
import { useState } from 'react';
import toast from 'react-hot-toast';

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormValues = yup.InferType<typeof schema>;

const UpdatePassword = () => {
  const { account: profile } = useLayoutContext();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const toastId = toast.loading('Updating password...');
    try {
      const result = await changeAccountPassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );

      if (result.ok) {
        toast.success(result.message, { id: toastId });
        reset();
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-bottom bg-transparent">
        <h4 className="card-header-title mb-1">Update Password</h4>
        <p className="mb-0 small text-secondary">
          Your current email address is <span className="text-primary fw-bold">{profile?.email || '...'}</span>
        </p>
      </CardHeader>

      <CardBody className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <PasswordFormInput
            name="currentPassword"
            label="Current password"
            placeholder="Enter current password"
            containerClass="mb-3"
            control={control}
          />

          <PasswordFormInput
            name="newPassword"
            label="New password"
            placeholder="Enter new password"
            containerClass="mb-3"
            control={control}
          />

          <PasswordFormInput
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Confirm new password"
            containerClass="mb-4"
            control={control}
          />

          <div className="text-end">
            <Button type="submit" variant="primary" className="mb-0 px-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default UpdatePassword;

