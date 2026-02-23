'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { BsArrowLeft, BsCheckCircleFill, BsEnvelopeCheck } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { verifyEmail, resendVerification, getStoredToken } from '@/app/helpers/auth';

// ─── Resend cooldown ──────────────────────────────────────────────────────────

const RESEND_COOLDOWN = 60; // seconds

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState(emailFromQuery);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-start resend cooldown so the user can't spam immediately
  useEffect(() => {
    setCountdown(RESEND_COOLDOWN);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Input handling ──────────────────────────────────────────────────────────

  const handleDigitChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    // Auto-advance
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleDigitKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const fullCode = code.join('');

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullCode.length < 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    if (!email) {
      toast.error('Email address is missing. Please go back and try again.');
      return;
    }

    setIsVerifying(true);
    const toastId = toast.loading('Verifying your email…');
    try {
      const result = await verifyEmail(email, fullCode);
      if (result.ok) {
        toast.success('Email verifiedsuccessfully! 🎉', { id: toastId, duration: 4000 });

        // Since they could be verifying while logged in, refresh account data
        const token = getStoredToken();
        if (token) {
          // You might need to add `useLayoutContext` if you want to cleanly refresh the global UI state or 
          // they can just reload/redirect. Redirecting to home is easiest.
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setTimeout(() => router.push('/auth/sign-in'), 1500);
        }
      } else {
        toast.error(result.message, { id: toastId });
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Resend ──────────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address is missing. Please go back and try again.');
      return;
    }
    setIsResending(true);
    const toastId = toast.loading('Sending a new code…');
    try {
      const result = await resendVerification(email);
      if (result.ok) {
        toast.success('A new code has been sent to your email.', { id: toastId });
        setCountdown(RESEND_COOLDOWN);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsResending(false);
    }
  };

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
                    style={{ width: 64, height: 64, background: 'var(--bs-primary-bg-subtle)' }}
                  >
                    <BsEnvelopeCheck size={30} className="text-primary" />
                  </div>
                  <h1 className="h4 mb-1">Verify Your Email</h1>
                  <p className="mb-0 text-secondary small">
                    We sent a 6-digit code to
                    {email ? (
                      <> <strong className="text-body">{email}</strong></>
                    ) : (
                      ' your email address'
                    )}
                    . Enter it below to activate your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="text-start">
                  {/* Email override (if not from query) */}
                  {!emailFromQuery && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Email address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="The email you registered with"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* 6-digit code input */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold d-block text-center mb-3">
                      Verification Code
                    </label>
                    <div
                      className="d-flex justify-content-center gap-2"
                      onPaste={handlePaste}
                    >
                      {code.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { inputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          className="form-control text-center fw-bold fs-4 p-2"
                          style={{
                            width: '3rem',
                            height: '3.5rem',
                            borderRadius: '0.5rem',
                            borderColor: digit ? 'var(--bs-primary)' : undefined,
                            transition: 'border-color 0.15s',
                          }}
                          aria-label={`Digit ${idx + 1}`}
                          autoComplete="off"
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 shadow-sm mb-3"
                    disabled={isVerifying || fullCode.length < 6}
                  >
                    {isVerifying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        <BsCheckCircleFill className="me-2" /> Verify Email
                      </>
                    )}
                  </Button>
                </form>

                {/* Resend */}
                <div className="text-center mt-2">
                  <p className="small text-secondary mb-2">
                    Didn&apos;t receive a code?{' '}
                    {countdown > 0 ? (
                      <span className="text-secondary">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 fw-semibold"
                        onClick={handleResend}
                        disabled={isResending}
                      >
                        {isResending ? 'Sending…' : 'Resend code'}
                      </button>
                    )}
                  </p>
                  <Link
                    href="/auth/sign-in"
                    className="small fw-bold text-primary d-inline-flex align-items-center"
                  >
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

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
