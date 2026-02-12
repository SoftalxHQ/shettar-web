'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { TextFormInput } from '@/app/components';
import Image from 'next/image';
import { BsArrowLeft } from 'react-icons/bs';

const ForgotPassword = () => {
  const forgotSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(forgotSchema),
  });

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
                  <h1 className="h4 mb-1">Forgot Password?</h1>
                  <p className="mb-0 text-secondary">Enter the email address associated with your account.</p>
                </div>

                <form onSubmit={handleSubmit(() => { })} className="mt-4 text-start">
                  <TextFormInput
                    name="email"
                    label="Email address"
                    placeholder="E.g: example@gmail.com"
                    containerClass="mb-4"
                    control={control}
                  />

                  <div>
                    <Button variant="primary" type="submit" className="w-100 mb-0 shadow">
                      Reset Password
                    </Button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <Link href="/auth/sign-in" className="small fw-bold text-primary items-center d-flex justify-content-center">
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
