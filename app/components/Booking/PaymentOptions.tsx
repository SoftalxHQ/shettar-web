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
import { useRouter } from 'next/navigation';
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

const PaymentOptions = () => {
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
    router.push('/booking-confirmed');
  };

  return (
    <Card className="shadow">
      <CardHeader className="border-bottom p-4 bg-transparent">
        <h4 className="card-title mb-0 items-center">
          <BsWalletFill className=" me-2" />
          Payment Options
        </h4>
      </CardHeader>
      <CardBody className="p-4 pb-0">
        <div className="bg-primary bg-opacity-10 rounded-3 mb-4 p-3 text-dark">
          <div className="d-md-flex justify-content-md-between align-items-center">
            <div className="d-sm-flex align-items-center mb-2 mb-md-0">
              <Image src="/images/element/16.svg" className="h-50px" alt="element" />
              <div className="ms-sm-3 mt-2 mt-sm-0 text-dark">
                <h5 className="card-title mb-0">Get Additional Discount</h5>
                <p className="mb-0">Login to access saved payments and discounts!</p>
              </div>
            </div>
            <Link href="/auth/sign-in">
              <Button variant="primary" className="mb-0 ms-md-2">
                Login now
              </Button>
            </Link>
          </div>
        </div>
        <Accordion defaultActiveKey="1" className="accordion-icon accordion-bg-light" id="accordioncircle">
          <AccordionItem eventKey="1" className="mb-3">
            <AccordionHeader as="h6" id="heading-1">
              <BsCreditCard className=" text-primary me-2" /> <span className="me-5 text-dark">Credit or Debit Card</span>
            </AccordionHeader>
            <AccordionBody>
              <div className="d-sm-flex justify-content-sm-between my-3">
                <h6 className="mb-2 mb-sm-0">We Accept:</h6>
                <ul className="list-inline my-0">
                  {paymentCards.map((card, idx) => (
                    <li key={idx} className="list-inline-item">
                      <Link href="#">
                        <Image src={card} className="h-30px" alt="card" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="g-3 row">
                <Col xs={12}>
                  <FormLabel className="text-dark">Card Number *</FormLabel>
                  <div className="position-relative">
                    <TextFormInput control={control} name="cardNo" type="text" maxLength={16} placeholder="XXXX XXXX XXXX XXXX" combinedInput />
                    <img src="/images/element/visa.svg" className="w-30px position-absolute top-50 end-0 translate-middle-y me-2 d-none d-sm-block" alt="visa" />
                  </div>
                </Col>

                <Col md={6}>
                  <FormLabel className="text-dark">Expiration date *</FormLabel>
                  <div className="input-group">
                    <TextFormInput maxLength={2} placeholder="Month" control={control} name="expiryMonth" combinedInput />
                    <TextFormInput maxLength={4} placeholder="Year" control={control} name="expiryYear" combinedInput />
                  </div>
                </Col>

                <TextFormInput containerClass="col-md-6" control={control} name="cvv" label="CVV / CVC *" maxLength={3} placeholder="xxx" />

                <TextFormInput
                  containerClass="col-12"
                  label="Name on Card *"
                  control={control}
                  name="cardHolderName"
                  placeholder="Enter card holder name"
                />

                <Col xs={12}>
                  <Alert show={isOpen} onClose={toggle} variant="success" className="fade my-3" role="alert" dismissible>
                    <div className="d-sm-flex align-items-center mb-3 text-dark">
                      <Image src="/images/element/12.svg" className="w-40px me-3 mb-2 mb-sm-0" alt="element" />
                      <h5 className="alert-heading mb-0">{currency}50,000 Covid Cover &amp; More</h5>
                    </div>
                    <p className="mb-2 text-dark">
                      Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see
                      how spacing within an alert works with this kind of content.
                    </p>
                    <div className="d-sm-flex align-items-center">
                      <Button variant="success" className="mb-2 mb-sm-0 me-3">
                        <FaPlus className="me-2" />
                        Add
                      </Button>
                      <h6 className="mb-0 text-dark">{currency}69 per person</h6>
                    </div>
                  </Alert>
                </Col>

                <Col xs={12}>
                  <div className="d-sm-flex justify-content-sm-between align-items-center text-dark">
                    <h4>
                      {currency}1800 <span className="small fs-6 text-dark font-normal">Due now</span>
                    </h4>
                    <Button variant="primary" type="submit" className="mb-0">
                      Pay Now
                    </Button>
                  </div>
                </Col>
              </form>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="2" className="mb-3">
            <AccordionHeader as="h6" id="heading-2">
              <BsGlobe2 className=" text-primary me-2" /> <span className="me-5 text-dark">Pay with Net Banking</span>
            </AccordionHeader>
            <AccordionBody>
              <Row className="row g-3 mt-1">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item">
                    <h6 className="mb-0 text-dark">Popular Banks:</h6>
                  </li>
                  <li className="list-inline-item mt-2">
                    <input type="radio" className="btn-check" name="options" id="option1" />
                    <label className="btn btn-light btn-primary-soft-check" htmlFor="option1">
                      <Image src="/images/element/13.svg" className="h-20px me-2" alt="bank" />
                      Bank of America
                    </label>
                  </li>
                  <li className="list-inline-item mt-2">
                    <input type="radio" className="btn-check" name="options" id="option2" />
                    <label className="btn btn-light btn-primary-soft-check" htmlFor="option2">
                      <Image src="/images/element/15.svg" className="h-20px me-2" alt="bank" />
                      Bank of Japan
                    </label>
                  </li>
                  <li className="list-inline-item mt-2">
                    <input type="radio" className="btn-check" name="options" id="option3" />
                    <label className="btn btn-light btn-primary-soft-check" htmlFor="option3">
                      <Image src="/images/element/14.svg" className="h-20px me-2" alt="bank" />
                      VIVIV Bank
                    </label>
                  </li>
                </ul>
                <p className="mb-1 text-dark small">In order to complete your transaction, we will transfer you over to Booking secure servers.</p>
                <p className="my-0 text-dark small">Select your bank from the drop-down list and click proceed to continue with your payment.</p>
                <Col md={6}>
                  <SelectFormInput className="form-select form-select-sm js-choice border-0">
                    <option value={-1}>Please choose one</option>
                    <option>Bank of America</option>
                    <option>Bank of India</option>
                    <option>Bank of London</option>
                  </SelectFormInput>
                </Col>
                <div className="d-grid">
                  <Button variant="success" className="mb-0">
                    Pay {currency}1800
                  </Button>
                </div>
              </Row>
            </AccordionBody>
          </AccordionItem>
          <AccordionItem eventKey="3" className="mb-3">
            <AccordionHeader as="h6" id="heading-3">
              <BsPaypal className=" text-primary me-2" />
              <span className="me-5 text-dark">Pay with Paypal</span>
            </AccordionHeader>
            <AccordionBody>
              <div className="card card-body border align-items-center text-center mt-4">
                <Image src="/images/element/paypal.svg" className="h-70px mb-3" alt="paypal" />
                <p className="mb-3 text-dark">
                  <strong>Tips:</strong> Simply click on the payment button below to proceed to the PayPal payment page.
                </p>
                <Button variant="outline-primary" size="sm" className="mb-0">
                  Pay with paypal
                </Button>
              </div>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <div className="card-footer p-4 pt-0 bg-transparent">
        <p className="mb-0 text-dark">
          By processing, You accept Booking <Link href="#">Terms of Services</Link> and <Link href="#">Policy</Link>
        </p>
      </div>
    </Card>
  );
};

export default PaymentOptions;
