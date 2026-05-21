'use client';

import { Card, CardBody, CardHeader } from 'react-bootstrap';
import { BsArrowRight, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

type PolicyHighlight = { kind: string; text: string };

const DEFAULT_HIGHLIGHTS: PolicyHighlight[] = [
  { kind: 'allow', text: 'Proper identification is required at the time of check-in.' },
  { kind: 'allow', text: 'Guests are requested to maintain a peaceful environment.' },
  { kind: 'deny', text: 'Illegal products are strictly banned on the premises.' },
];

const DEFAULT_BULLETS = [
  'Please respect quiet hours and fellow guests during your stay.',
];

const DEFAULT_FOOTER =
  'The hotel reserves the right of admission. Please review all terms before booking.';

interface HotelPoliciesProps {
  hotel: {
    check_in?: string;
    check_out?: string;
    policy_highlights?: PolicyHighlight[];
    policy_bullets?: string[];
    policy_footer?: string | null;
  };
}

const HotelPolicies = ({ hotel }: HotelPoliciesProps) => {
  const highlights =
    hotel.policy_highlights?.length ? hotel.policy_highlights : DEFAULT_HIGHLIGHTS;

  const timeBullets: string[] = [];
  if (hotel.check_in) timeBullets.push(`Check-in: ${hotel.check_in}`);
  if (hotel.check_out) timeBullets.push(`Check out: ${hotel.check_out}`);

  const policyBullets = hotel.policy_bullets?.length ? hotel.policy_bullets : DEFAULT_BULLETS;
  const bullets = [...timeBullets, ...policyBullets];
  const footer = hotel.policy_footer?.trim() || DEFAULT_FOOTER;

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="border-bottom bg-transparent px-0 pt-0">
        <h3 className="mb-0">Hotel Policies</h3>
      </CardHeader>
      <CardBody className="pt-4 p-0">
        <ul className="list-group list-group-borderless mb-2">
          {highlights.map((item, idx) => (
            <li key={idx} className="list-group-item d-flex align-items-start">
              {item.kind === 'deny' ? (
                <BsXCircleFill className="me-2 text-danger mt-1" />
              ) : (
                <BsCheckCircleFill className="me-2 text-success mt-1" />
              )}
              {item.text}
            </li>
          ))}
        </ul>
        {bullets.length > 0 && (
          <ul className="list-group list-group-borderless mb-2">
            {bullets.map((item, idx) => (
              <li key={idx} className="list-group-item h6 fw-light mb-0 items-center">
                <BsArrowRight className="me-2 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        )}
        <div className="bg-body-tertiary rounded-2 p-3 mb-3 border">
          <p className="mb-0 small opacity-50">{footer}</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default HotelPolicies;
