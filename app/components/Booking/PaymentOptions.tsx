'use client';

import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormLabel,
  Image,
  Row,
} from 'react-bootstrap';
import { BsCreditCard, BsGlobe2, BsPaypal, BsWalletFill } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FaPlus } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SelectFormInput, TextFormInput } from '@/app/components';
import { useToggle } from '@/app/hooks';

const currency = '₦';

const paymentCards = [
  '/images/element/visa.svg',
  '/images/element/mastercard.svg',
  '/images/element/expresscard.svg'
];

const PaymentOptions = ({ room, hotel }: { room: any, hotel: any }) => {
  const params = useParams();
  const hotelSlug = params.hotelSlug as string;
  const roomSlug = params.roomSlug as string;

  const price = room?.price || 0;
  const nights = 1;
  const total = (price * nights) * 1.05; // Matching PriceSummary taxes

  const paymentSchema = yup.object({
    cardNo: yup.string().required('Please enter your card number'),
    expiryMonth: yup.string().required('Please enter your card expiration month'),
    expiryYear: yup.string().required('Please enter your card expiration year'),
    cvv: yup.string().required('Please enter your card CVV number'),
    cardHolderName: yup.string().required('Please enter card holder name'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(paymentSchema),
  });

  const router = useRouter();
  const { isOpen, toggle } = useToggle(true);

  const onSubmit = () => {
    router.push(`/hotel/${hotelSlug}/roomtype/${roomSlug}/booking-confirmed`);
  };

  return (
    <Card className="shadow">
      <CardHeader className="border-bottom p-4 bg-transparent">
        <h4 className="card-title mb-0 items-center">
          <BsWalletFill className=" me-2" />
          Payment Options
        </h4>
      </CardHeader>
      <CardBody className="p-4">
        <Accordion defaultActiveKey="1" className="accordion-icon accordion-bg-light" id="accordioncircle">
          <AccordionItem eventKey="1" className="mb-3">
            <AccordionHeader as="h6" id="heading-1">
              <BsWalletFill className=" text-primary me-2" /> <span className="me-5 text-inherit">Pay with Wallet</span>
            </AccordionHeader>
            <AccordionBody>
              <div className="bg-light p-3 rounded-3 mb-3 border">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 opacity-75">Available Balance</h6>
                    <h5 className="mb-0 text-primary">{currency}0.00</h5>
                  </div>
                  <Button variant="outline-primary" size="sm">Add Funds</Button>
                </div>
              </div>
              <p className="small opacity-50 mb-3">Your wallet balance will be debited for this booking.</p>
              <Button variant="primary" className="w-100 mb-0" onClick={onSubmit}>
                Pay {currency}{total.toLocaleString()} Now
              </Button>
            </AccordionBody>
          </AccordionItem>

          <AccordionItem eventKey="2" className="mb-3">
            <AccordionHeader as="h6" id="heading-2">
              <BsCreditCard className=" text-primary me-2" /> <span className="me-5 text-inherit">Pay with Card (Paystack)</span>
            </AccordionHeader>
            <AccordionBody>
              <div className="text-center py-4">
                <Image src="/images/element/visa.svg" className="h-30px me-2" alt="visa" />
                <Image src="/images/element/mastercard.svg" className="h-30px me-2" alt="mastercard" />
                <Image src="/images/element/expresscard.svg" className="h-30px" alt="express" />
                <p className="mt-3 mb-4 opacity-75">You will be redirected to Paystack to complete your payment securely.</p>
                <Button variant="primary" className="w-100 mb-0" onClick={onSubmit}>
                  Proceed to Payment
                </Button>
              </div>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <div className="card-footer p-4 pt-0 bg-transparent text-center">
        <p className="mb-0 opacity-50 small">
          By processing, You accept Abri <Link href="#" className="text-primary text-decoration-none border-bottom">Terms of Services</Link> and <Link href="#" className="text-primary text-decoration-none border-bottom">Policy</Link>
        </p>
      </div>
    </Card>
  );
};

export default PaymentOptions;
