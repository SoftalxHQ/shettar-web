'use client';

import { Card, CardHeader } from 'react-bootstrap';

const currency = '$';

const OfferAndDiscounts = () => {
  return (
    <Card className="shadow">
      <CardHeader className="border-bottom bg-transparent">
        <div className="card-title">
          <h5 className="mb-0">Offer &amp; Discount</h5>
        </div>
      </CardHeader>
      <CardHeader className="bg-transparent border-0">
        <div className="bg-light rounded-2 p-3 text-dark mb-3">
          <div className="form-check form-check-inline mb-0">
            <input className="form-check-input" type="radio" name="discountOptions" id="discount1" defaultValue="option1" defaultChecked />
            <label className="form-check-label h5 mb-0" htmlFor="discount1">
              GSTBOOK
            </label>
            <p className="mb-1 small">Congratulations! You have saved {currency}230 with GSTBOOK.</p>
            <h6 className="mb-0 text-success">-{currency}230</h6>
          </div>
        </div>
        <form className="input-group">
          <div className="input-group mt-3">
            <input className="form-control" placeholder="Coupon code" />
            <button type="button" className="btn btn-primary">
              Apply
            </button>
          </div>
        </form>
      </CardHeader>
    </Card>
  );
};

export default OfferAndDiscounts;
