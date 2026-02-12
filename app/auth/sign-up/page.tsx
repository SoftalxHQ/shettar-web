'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { PasswordFormInput, TextFormInput } from '@/app/components';
import { BsGoogle, BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import Image from 'next/image';
import { useState } from 'react';

const SignUp = () => {
  const [step, setStep] = useState(1);

  const registerSchema = yup.object({
    firstName: yup.string().required('Please enter your first name'),
    lastName: yup.string().required('Please enter your last name'),
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Please enter your password'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const { control, handleSubmit, trigger } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const nextStep = async () => {
    const isStepValid = await trigger(['firstName', 'lastName', 'email']);
    if (isStepValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  return (
    <section className="vh-xxl-100 p-0 m-0 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center align-items-center g-0">
          <Col xl={5} lg={7} md={9}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden my-5">
              <CardBody className="p-4 p-sm-5">
                <div className="text-center mb-4">
                  <Link href="/">
                    <Image src="/images/logo/logo.svg" height={50} width={160} alt="logo" className="mb-3" />
                  </Link>
                  <h1 className="h4 mb-1">Create an account</h1>
                  <p className="mb-0 text-secondary">
                    {step === 1 ? 'Tell us a bit about yourself.' : 'Secure your account.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="progress progress-sm">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: step === 1 ? '50%' : '100%' }}
                      aria-valuenow={step === 1 ? 50 : 100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <form onSubmit={handleSubmit(() => { })} className="mt-4 text-start">
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

                      <Button variant="primary" type="button" className="w-100 mb-0 shadow-sm items-center d-flex justify-content-center" onClick={nextStep}>
                        Next Step <BsArrowRight className="ms-2" />
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="step-animation">
                      <PasswordFormInput
                        name="password"
                        label="Password"
                        placeholder="Create a password"
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
                        <input type="checkbox" className="form-check-input border-secondary" id="terms" />
                        <label className="form-check-label small" htmlFor="terms">
                          By signing up, you agree to our <Link href="/terms" className="text-primary fw-semibold">Terms of Service</Link>
                        </label>
                      </div>

                      <div className="d-flex gap-3">
                        <Button variant="light" type="button" className="w-100 border shadow-sm items-center d-flex justify-content-center" onClick={prevStep}>
                          <BsArrowLeft className="me-2" /> Back
                        </Button>
                        <Button variant="primary" type="submit" className="w-100 shadow-sm">
                          Create Account
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <>
                      <div className="position-relative my-4 text-center">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle bg-body px-3 small text-secondary">
                          Or register with
                        </span>
                      </div>

                      <Button variant="light" className="w-100 mb-0 border shadow-sm items-center d-flex justify-content-center py-2">
                        <BsGoogle className="text-danger me-2" /> Register with Google
                      </Button>
                    </>
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
