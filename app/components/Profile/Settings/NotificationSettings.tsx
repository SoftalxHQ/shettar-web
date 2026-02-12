'use client';

import { Button, Card, CardHeader, CardBody } from 'react-bootstrap';

const NotificationSettings = () => {
  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title text-dark">Notification Settings</h4>
      </CardHeader>

      <CardBody>
        <form>
          <div className="mb-4">
            <label className="form-label text-dark">
              Newsletter<span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-2 gap-sm-4 flex-wrap">
              <div className="form-check radio-bg-light">
                <input className="form-check-input" type="radio" name="newsletter" id="daily" defaultChecked />
                <label className="form-check-label text-dark" htmlFor="daily">
                  Daily
                </label>
              </div>
              <div className="form-check radio-bg-light">
                <input className="form-check-input" type="radio" name="newsletter" id="twiceWeek" />
                <label className="form-check-label text-dark" htmlFor="twiceWeek">
                  Twice a week
                </label>
              </div>
              <div className="form-check radio-bg-light">
                <input className="form-check-input" type="radio" name="newsletter" id="weekly" />
                <label className="form-check-label text-dark" htmlFor="weekly">
                  Weekly
                </label>
              </div>
              <div className="form-check radio-bg-light">
                <input className="form-check-input" type="radio" name="newsletter" id="never" />
                <label className="form-check-label text-dark" htmlFor="never">
                  Never
                </label>
              </div>
            </div>
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="notifyEmail">
              Notify me via email when logging in
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="notifyEmail" defaultChecked />
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="bookingAssists">
              I would like to receive booking assist reminders
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="bookingAssists" defaultChecked />
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="promotions">
              I would like to receive emails about Booking promotions
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="promotions" defaultChecked />
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="tripOffers">
              I would like to know about information and offers related to my upcoming trip
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="tripOffers" defaultChecked />
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="profilePublic">
              Show your profile publicly
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="profilePublic" />
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="smsConfirm">
              Send SMS confirmation for all online payments
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="smsConfirm" />
          </div>

          <div className="form-check form-switch form-check-md d-flex justify-content-between mb-4">
            <label className="form-check-label ps-0 pe-4 text-dark" htmlFor="accessDevices">
              Check which device(s) access your account
            </label>
            <input className="form-check-input flex-shrink-0" type="checkbox" id="accessDevices" defaultChecked />
          </div>

          <div className="d-sm-flex justify-content-end gap-2">
            <Button type="button" variant="primary" size="sm" className="mb-0">
              Save changes
            </Button>
            <Button size="sm" variant="outline-secondary" className="mb-0">
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default NotificationSettings;
