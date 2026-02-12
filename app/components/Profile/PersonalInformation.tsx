'use client';

import { SelectFormInput, TextAreaFormInput, TextFormInput, Flatpicker } from '@/app/components';
import { Button, Card, CardBody, CardHeader, Col, Image } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

const PersonalInformation = () => {
  const informationSchema = yup.object({
    name: yup.string().required('Please enter your full name'),
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    mobileNo: yup.number().required('Please enter your mobile number'),
    address: yup.string().required('Please enter your address'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(informationSchema),
    defaultValues: {
      name: 'Jacqueline Miller',
      email: 'hello@gmail.com',
      mobileNo: 222555666,
      address: '2119 N Division Ave, New Hampshire, York, United States',
    },
  });

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title">Personal Information</h4>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit(() => { })} className="row g-3">
          <Col xs={12}>
            <label className="form-label">
              Upload your profile photo<span className="text-danger">*</span>
            </label>
            <div className="d-flex align-items-center">
              <label className="position-relative me-4" htmlFor="uploadfile-1" title="Replace this pic">
                <span className="avatar avatar-xl">
                  <Image
                    id="uploadfile-1-preview"
                    className="avatar-img rounded-circle border border-white border-3 shadow"
                    src="/images/avatar/01.jpg"
                    alt="avatar"
                    width={100}
                    height={100}
                  />
                </span>
              </label>

              <label className="btn btn-sm btn-primary-soft mb-0" htmlFor="uploadfile-1">
                Change
              </label>
              <input id="uploadfile-1" className="form-control d-none" type="file" />
            </div>
          </Col>

          <TextFormInput
            name="name"
            label="Full Name*"
            placeholder="Enter your full name"
            containerClass="col-md-6"
            control={control}
          />
          <TextFormInput
            name="email"
            type="email"
            label="Email address*"
            placeholder="Enter your email id"
            containerClass="col-md-6"
            control={control}
          />
          <TextFormInput
            name="mobileNo"
            label="Mobile number*"
            placeholder="Enter your mobile number"
            containerClass="col-md-6"
            control={control}
          />

          <Col md={6}>
            <label className="form-label">
              Nationality<span className="text-danger">*</span>
            </label>
            <SelectFormInput className="form-select js-choice">
              <option>Select your country</option>
              <option>USA</option>
              <option>Paris</option>
              <option>India</option>
              <option>UK</option>
            </SelectFormInput>
          </Col>

          <Col md={6}>
            <label className="form-label">
              Date of Birth<span className="text-danger">*</span>
            </label>
            <Flatpicker
              placeholder="Enter date of birth"
              options={{ dateFormat: 'd M Y', defaultDate: '29 Aug 1996' }}
            />
          </Col>

          <Col md={6}>
            <label className="form-label">
              Select Gender<span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-4">
              <div className="form-check radio-bg-light">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="flexRadioDefault1"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Male
                </label>
              </div>
              <div className="form-check radio-bg-light">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  Female
                </label>
              </div>
              <div className="form-check radio-bg-light">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" />
                <label className="form-check-label" htmlFor="flexRadioDefault3">
                  Others
                </label>
              </div>
            </div>
          </Col>

          <TextAreaFormInput
            name="address"
            label="Address"
            spellCheck="false"
            rows={3}
            containerClass="col-12"
            control={control}
          />

          <Col xs={12} className="text-end">
            <Button variant="primary" type="submit" className="mb-0">
              Save Changes
            </Button>
          </Col>
        </form>
      </CardBody>
    </Card>
  );
};

export default PersonalInformation;
