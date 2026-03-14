'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PasswordFormInput, TextFormInput } from '@/app/components';
import { BsArrowLeft, BsArrowRight, BsCheckCircleFill } from 'react-icons/bs';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { signUp } from '@/app/helpers/auth';
import { useLayoutContext } from '@/app/states';

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const router = useRouter();
  const { refreshAuth, refreshAccount } = useLayoutContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const registerSchema = yup.object({
    firstName: yup.string().required('Please enter your first name'),
    lastName: yup.string().required('Please enter your last name'),
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Please enter your password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const { control, handleSubmit, trigger } = useForm<FormValues>({
    resolver: yupResolver(registerSchema),
  });

  const nextStep = async () => {
    const isStepValid = await trigger(['firstName', 'lastName', 'email']);
    if (isStepValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  const onSubmit = async (values: FormValues) => {
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Creating your account…');

    try {
      const result = await signUp({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });

      if (result.ok) {
        toast.success('Account created! Welcome to Shettar!', { id: toastId, duration: 4000 });
        await refreshAuth();
        await refreshAccount();
        setTimeout(() => router.push('/'), 1500);
      } else {
        const detail = result.errors?.length
          ? result.errors.join(' • ')
          : result.message;
        toast.error(detail, { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="vh-xxl-100 p-0 m-0 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center align-items-center g-0">
          <Col xl={5} lg={7} md={9}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden my-5">
              <CardBody className="p-4 p-sm-5">
                <div className="text-center mb-4">
                  <Link href="/">
                    <Image src="/images/logo/shettar-logo.png" height={50} width={160} alt="logo" className="mb-3" style={{ objectFit: 'contain' }} />
                  </Link>
                  <h1 className="h4 mb-1">Create an account</h1>
                  <p className="mb-0 text-secondary">
                    {step === 1 ? 'Tell us a bit about yourself.' : 'Secure your account.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-secondary">Step {step} of 2</small>
                    <small className="text-secondary">{step === 1 ? '50%' : '100%'}</small>
                  </div>
                  <div className="progress progress-sm">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: step === 1 ? '50%' : '100%', transition: 'width 0.4s ease' }}
                      aria-valuenow={step === 1 ? 50 : 100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 text-start">
                  {step === 1 && (
                    <div className="step-animation">
                      <Row className="g-3 mb-3">
                        <Col md={6}>
                          <TextFormInput
                            name="firstName"
                            label="First Name"
                            placeholder="John"
                            control={control}
                          />
                        </Col>
                        <Col md={6}>
                          <TextFormInput
                            name="lastName"
                            label="Last Name"
                            placeholder="Doe"
                            control={control}
                          />
                        </Col>
                      </Row>

                      <TextFormInput
                        name="email"
                        label="Email address"
                        placeholder="E.g: example@gmail.com"
                        containerClass="mb-4"
                        control={control}
                      />

                      <Button
                        variant="primary"
                        type="button"
                        className="w-100 mb-0 shadow-sm items-center d-flex justify-content-center"
                        onClick={nextStep}
                      >
                        Next Step <BsArrowRight className="ms-2" />
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="step-animation">
                      <PasswordFormInput
                        name="password"
                        label="Password"
                        placeholder="Create a password (min 8 characters)"
                        containerClass="mb-3"
                        control={control}
                      />

                      <PasswordFormInput
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Repeat password"
                        containerClass="mb-3"
                        control={control}
                      />

                      <div className="mb-4 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input border-secondary"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="terms">
                          By signing up, you agree to our{' '}
                          <Link href="/terms" className="text-primary fw-semibold">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-primary fw-semibold">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>

                      <div className="d-flex gap-3">
                        <Button
                          variant="light"
                          type="button"
                          className="border shadow-sm items-center d-flex justify-content-center px-4 flex-shrink-0"
                          onClick={prevStep}
                          disabled={isLoading}
                        >
                          <BsArrowLeft className="me-2" /> Back
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          className="w-100 shadow-sm flex-grow-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                              Creating…
                            </>
                          ) : (
                            <>
                              <BsCheckCircleFill className="me-2" /> Create Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                </form>

                <div className="text-center mt-4">
                  <p className="mb-0 small">
                    Already have an account?{' '}
                    <Link href="/auth/sign-in" className="fw-bold text-primary">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SignUp;
