'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PasswordFormInput, TextFormInput } from '@/app/components';
import { BsGoogle } from 'react-icons/bs';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { signIn } from '@/app/helpers/auth';
import { useLayoutContext } from '@/app/states';

type FormValues = {
  email: string;
  password: string;
};

const SignIn = () => {
  const router = useRouter();
  const { refreshAuth, refreshAccount } = useLayoutContext();
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  });

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const toastId = toast.loading('Signing in…');

    try {
      const result = await signIn({ email: values.email, password: values.password });

      if (result.ok) {
        toast.success('Welcome back! 👋', { id: toastId });
        await refreshAuth();
        await refreshAccount();
        router.push('/');
      } else if (result.errorCode === 'email_not_verified') {
        toast.error('Please verify your email first.', { id: toastId });
        router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        toast.error(result.message, { id: toastId });
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
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <CardBody className="p-4 p-sm-5">
                <div className="text-center mb-4">
                  <Link href="/">
                    <Image src="/images/logo/logo.svg" height={50} width={160} alt="logo" className="mb-3" />
                  </Link>
                  <h1 className="h4 mb-1">Welcome back</h1>
                  <p className="mb-0 text-secondary">Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 text-start">
                  <TextFormInput
                    name="email"
                    label="Email address"
                    placeholder="E.g: example@gmail.com"
                    containerClass="mb-3"
                    control={control}
                  />

                  <div className="mb-3">
                    <PasswordFormInput
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      control={control}
                    />
                    <div className="d-flex justify-content-end mt-2">
                      <Link href="/auth/forgot-password" title="Forgot password?" className="small text-primary fw-semibold">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input border-secondary" id="rememberMe" />
                    <label className="form-check-label small" htmlFor="rememberMe">
                      Keep me signed in
                    </label>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-0 shadow-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Signing In…
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>

                  <div className="position-relative my-4 text-center">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-body px-3 small text-secondary">
                      Or continue with
                    </span>
                  </div>

                  <Button
                    variant="light"
                    className="w-100 mb-0 border shadow-sm items-center d-flex justify-content-center py-2"
                    disabled
                    title="Google sign-in coming soon"
                  >
                    <BsGoogle className="text-danger me-2" /> Continue with Google
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <p className="mb-0 small">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/sign-up" className="fw-bold text-primary">
                      Sign up here
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

export default SignIn;
