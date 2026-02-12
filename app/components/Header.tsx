'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Container, Navbar, Nav } from 'react-bootstrap';

export default function Header() {
  return (
    <header className="navbar-light header-sticky">
      <Navbar expand="xl" className="navbar-expand-xl">
        <Container>
          <Link href="/" className="navbar-brand">
            <Image
              src="/images/logo/logo-light.svg"
              alt="logo"
              width={160}
              height={40}
              className="light-mode-item navbar-brand-item"
            />
          </Link>

          <Navbar.Toggle aria-controls="navbarCollapse" />

          <Navbar.Collapse id="navbarCollapse">
            <Nav className="navbar-nav mx-auto">
              <Nav.Link href="#">Home</Nav.Link>
              <Nav.Link href="#">Hotels</Nav.Link>
              <Nav.Link href="#">Flights</Nav.Link>
              <Nav.Link href="#">Tours</Nav.Link>
              <Nav.Link href="#">Cabs</Nav.Link>
            </Nav>

            <Nav className="navbar-nav ms-auto">
              <Link href="/auth/sign-in" className="btn btn-sm btn-primary mb-0 flex-centered">
                Sign In
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
