'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TextFormInput, PasswordFormInput } from '@/app/components';
import Image from 'next/image';
import {
  BsArrowLeft,
  BsEnvelopeCheck,
  BsCheckCircleFill,
  BsEye,
  BsEyeSlash,
  BsShieldLock,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import { requestPasswordReset, resetPassword } from '@/app/helpers/auth';

// ─── Step 1 — Email form ──────────────────────────────────────────────────────

type EmailFormValues = { email: string };

const emailSchema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Please enter your email'),
});

// ─── Step 2 — Reset form ──────────────────────────────────────────────────────

type ResetFormValues = {
  resetCode: string;
  password: string;
  confirmPassword: string;
};

const resetSchema = yup.object({
  resetCode: yup
    .string()
    .length(6, 'The reset code must be exactly 6 digits')
    .matches(/^\d{6}$/, 'The reset code must be numeric')
    .required('Please enter the reset code'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Please enter a new password'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your new password'),
});

// ─── Component ────────────────────────────────────────────────────────────────

type Step = 'email' | 'reset' | 'success';

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Email form ──
  const emailForm = useForm<EmailFormValues>({
    resolver: yupResolver(emailSchema),
  });

  const onEmailSubmit = async (values: EmailFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading('Sending reset code…');
    try {
      const result = await requestPasswordReset(values.email);
      if (result.ok) {
        setEmail(values.email);
        toast.success('Reset code sent! Check your inbox.', { id: toastId });
        setStep('reset');
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reset form ──
  const resetForm = useForm<ResetFormValues>({
    resolver: yupResolver(resetSchema),
  });

  const onResetSubmit = async (values: ResetFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading('Resetting password…');
    try {
      const result = await resetPassword(values.resetCode, values.password, values.confirmPassword);
      if (result.ok) {
        toast.success('Password reset successfully!', { id: toastId });
        setStep('success');
        setTimeout(() => router.push('/auth/sign-in'), 3000);
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step: success ───────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <section className="vh-xxl-100 p-0 m-0 d-flex align-items-center bg-light">
        <Container>
          <Row className="justify-content-center align-items-center g-0">
            <Col xl={5} lg={7} md={9}>
              <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                <CardBody className="p-4 p-sm-5 text-center">
                  <div className="mb-4">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: 72, height: 72, background: 'var(--bs-success-bg-subtle)' }}
                    >
                      <BsCheckCircleFill size={36} className="text-success" />
                    </div>
                    <h1 className="h4 mb-2">Password Reset!</h1>
                    <p className="text-secondary mb-1">
                      Your password has been updated successfully.
                    </p>
                    <p className="text-secondary small">
                      Redirecting you to sign in in a moment…
                    </p>
                  </div>

                  <Link href="/auth/sign-in">
                    <Button variant="primary" className="w-100 shadow-sm">
                      Go to Sign In
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  // ─── Step: reset (enter code + new password) ─────────────────────────────────

  if (step === 'reset') {
    return (
      <section className="vh-xxl-100 p-0 m-0 d-flex align-items-center bg-light">
        <Container>
          <Row className="justify-content-center align-items-center g-0">
            <Col xl={5} lg={7} md={9}>
              <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                <CardBody className="p-4 p-sm-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <Link href="/">
                      <Image src="/images/logo/logo.svg" height={50} width={160} alt="logo" className="mb-3" />
                    </Link>
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: 56, height: 56, background: 'var(--bs-primary-bg-subtle)' }}
                    >
                      <BsShieldLock size={26} className="text-primary" />
                    </div>
                    <h1 className="h4 mb-1">Enter Reset Code</h1>
                    <p className="mb-0 text-secondary small">
                      We sent a 6-digit code to{' '}
                      <strong className="text-body">{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="text-start">
                    {/* Reset code */}
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Reset Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className={`form-control form-control-lg text-center fw-bold ls-3 font-monospace ${resetForm.formState.errors.resetCode ? 'is-invalid' : ''
                          }`}
                        placeholder="• • • • • •"
                        {...resetForm.register('resetCode', {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                          },
                        })}
                      />
                      {resetForm.formState.errors.resetCode && (
                        <div className="invalid-feedback">
                          {resetForm.formState.errors.resetCode.message}
                        </div>
                      )}
                      <div className="form-text">Check your inbox (and spam folder).</div>
                    </div>

                    {/* New password */}
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">New Password</label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control pe-5 ${resetForm.formState.errors.password ? 'is-invalid' : ''
                            }`}
                          placeholder="Create a new password"
                          {...resetForm.register('password')}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-secondary"
                          onClick={() => setShowPassword((p) => !p)}
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
                        </button>
                        {resetForm.formState.errors.password && (
                          <div className="invalid-feedback">
                            {resetForm.formState.errors.password.message}
                          </div>
                        )}
                      </div>
                      <div className="form-text">Must be at least 8 characters.</div>
                    </div>

                    {/* Confirm password */}
                    <div className="mb-4">
                      <label className="form-label small fw-semibold">Confirm New Password</label>
                      <div className="position-relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          className={`form-control pe-5 ${resetForm.formState.errors.confirmPassword ? 'is-invalid' : ''
                            }`}
                          placeholder="Repeat your new password"
                          {...resetForm.register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-secondary"
                          onClick={() => setShowConfirm((p) => !p)}
                          tabIndex={-1}
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
                        </button>
                        {resetForm.formState.errors.confirmPassword && (
                          <div className="invalid-feedback">
                            {resetForm.formState.errors.confirmPassword.message}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 shadow-sm mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Resetting…
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </form>

                  {/* Resend / change email */}
                  <div className="text-center mt-2">
                    <p className="small text-secondary mb-1">
                      Didn&apos;t receive the code?{' '}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 fw-semibold"
                        onClick={() => {
                          resetForm.reset();
                          setStep('email');
                        }}
                      >
                        Try again
                      </button>
                    </p>
                    <Link href="/auth/sign-in" className="small fw-bold text-primary d-inline-flex align-items-center">
                      <BsArrowLeft className="me-1" /> Back to sign in
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  // ─── Step: email (initial) ────────────────────────────────────────────────────

  return (
    <section className="vh-xxl-100 p-0 m-0 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center align-items-center g-0">
          <Col xl={5} lg={7} md={9}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <CardBody className="p-4 p-sm-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <Link href="/">
                    <Image src="/images/logo/logo.svg" height={50} width={160} alt="logo" className="mb-3" />
                  </Link>
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: 56, height: 56, background: 'var(--bs-primary-bg-subtle)' }}
                  >
                    <BsEnvelopeCheck size={26} className="text-primary" />
                  </div>
                  <h1 className="h4 mb-1">Forgot Password?</h1>
                  <p className="mb-0 text-secondary">
                    Enter your email and we&apos;ll send you a 6-digit reset code.
                  </p>
                </div>

                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-4 text-start">
                  <TextFormInput
                    name="email"
                    label="Email address"
                    placeholder="E.g: example@gmail.com"
                    containerClass="mb-4"
                    control={emailForm.control}
                  />

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-0 shadow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Sending Code…
                      </>
                    ) : (
                      'Send Reset Code'
                    )}
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <Link
                    href="/auth/sign-in"
                    className="small fw-bold text-primary items-center d-flex justify-content-center"
                  >
                    <BsArrowLeft className="me-2" /> Back to sign in
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ForgotPassword;
