'use client';

import { SelectFormInput, TextAreaFormInput, TextFormInput } from '@/app/components';
import { Button, Card, CardBody, CardHeader, Col, Image, Modal } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useRef, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';
import { saveAccountProfile } from '@/app/hooks/useAccountProfile';
import { Flatpicker } from '@/app/components';

type FormValues = {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  gender: string;
  date_of_birth: string;
  emer_first_name: string;
  emer_last_name: string;
  emer_phone_number: string;
};

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  phone_number: yup.string().default(''),
  address: yup.string().default(''),
  gender: yup.string().default(''),
  date_of_birth: yup.string().default(''),
  emer_first_name: yup.string().default(''),
  emer_last_name: yup.string().default(''),
  emer_phone_number: yup.string().default(''),
});

const GENDER_OPTIONS = ['Male', 'Female'];

const PersonalInformation = () => {
  const { account: profile, isAccountLoading: isLoading, refreshAccount } = useLayoutContext();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const flatpickrOptions = useMemo(() => ({
    dateFormat: 'Y-m-d',
    maxDate: 'today',
  }), []);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      gender: '',
      date_of_birth: '',
      emer_first_name: '',
      emer_last_name: '',
      emer_phone_number: '',
    },
  });

  // Populate form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
        emer_first_name: profile.emer_first_name || '',
        emer_last_name: profile.emer_last_name || '',
        emer_phone_number: profile.emer_phone_number || '',
      });
    }
  }, [profile, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    const toastId = toast.loading('Saving changes…');
    try {
      const result = await saveAccountProfile(values, avatarFile);
      if (result.ok) {
        toast.success(result.message, { id: toastId });
        setAvatarFile(null);
        refreshAccount(); // refresh global state
      } else {
        toast.error(result.message, { id: toastId });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc = avatarPreview ?? profile?.avatar_url ?? null;

  if (isLoading && !profile) {
    return (
      <Card className="border">
        <CardHeader className="border-bottom">
          <div className="placeholder-glow">
            <span className="placeholder col-4" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="placeholder-glow">
            <div className="d-flex align-items-center mb-4">
              <span className="placeholder rounded-circle" style={{ width: 80, height: 80 }} />
              <div className="ms-3 w-50">
                <span className="placeholder col-6 mb-2" />
                <span className="placeholder col-4" />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-6"><span className="placeholder col-12 py-3" /></div>
              <div className="col-md-6"><span className="placeholder col-12 py-3" /></div>
              <div className="col-md-6"><span className="placeholder col-12 py-3" /></div>
              <div className="col-md-6"><span className="placeholder col-12 py-3" /></div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="border-bottom">
        <h4 className="card-header-title">Personal Information</h4>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
          {/* Avatar upload */}
          <Col xs={12}>
            <label className="form-label">Profile Photo</label>
            <div className="d-flex align-items-center gap-3">
              <div
                className="position-relative flex-shrink-0"
                style={{ width: 80, height: 80, cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
              >
                {avatarSrc ? (
                  <Image
                    className="rounded-circle border border-primary border-3 shadow object-fit-cover"
                    src={avatarSrc}
                    alt="avatar"
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary-soft d-flex align-items-center justify-content-center border border-primary border-3 shadow"
                    style={{ width: 80, height: 80 }}
                  >
                    <span className="h3 text-primary mb-0">
                      {profile?.first_name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Button
                  variant="primary-soft"
                  size="sm"
                  className="mb-1 d-block"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Change Photo
                </Button>
                <p className="small text-secondary mb-0">JPG, PNG or WEBP. Max 5MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleAvatarChange}
              />
            </div>
          </Col>

          <TextFormInput
            name="first_name"
            label="First Name*"
            placeholder="Enter your first name"
            containerClass="col-md-6"
            control={control}
          />
          <TextFormInput
            name="last_name"
            label="Last Name*"
            placeholder="Enter your last name"
            containerClass="col-md-6"
            control={control}
          />
          <TextFormInput
            name="phone_number"
            label="Mobile Number"
            placeholder="e.g. +234 800 000 0000"
            containerClass="col-md-6"
            control={control}
          />

          <Col md={6}>
            <label className="form-label">Gender</label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <SelectFormInput
                  className="form-select js-choice"
                  {...field}
                  onChange={(val) => field.onChange(val)}
                  value={field.value}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </SelectFormInput>
              )}
            />
          </Col>

          <Col md={6}>
            <label className="form-label">Date of Birth</label>
            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => {
                const dateValue = (field.value && !isNaN(new Date(field.value).getTime()))
                  ? new Date(field.value)
                  : undefined;
                return (
                  <Flatpicker
                    value={dateValue}
                    options={flatpickrOptions}
                    placeholder="YYYY-MM-DD"
                    className="form-control"
                    getValue={(date) => {
                      if (date instanceof Date && !isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        field.onChange(`${year}-${month}-${day}`);
                      }
                    }}
                  />
                );
              }}
            />
          </Col>

          <TextAreaFormInput
            name="address"
            label="Address"
            placeholder="Your full address"
            rows={3}
            containerClass="col-12"
            control={control}
          />

          <Col xs={12} className="mt-4 pt-2 border-top">
            <h5 className="mb-0">Next of Kin Details</h5>
            <p className="small text-secondary">Person to contact in case of emergency.</p>
          </Col>

          <TextFormInput
            name="emer_first_name"
            label="First Name"
            placeholder="Next of kin first name"
            containerClass="col-md-6"
            control={control}
          />
          <TextFormInput
            name="emer_last_name"
            label="Last Name"
            placeholder="Next of kin last name"
            containerClass="col-md-6"
            control={control}
          />
          <TextFormInput
            name="emer_phone_number"
            label="Phone Number"
            placeholder="Next of kin phone number"
            containerClass="col-md-12"
            control={control}
          />

          <Col xs={12} className="text-end">
            <Button variant="primary" type="submit" className="mb-0" disabled={isSaving || isLoading}>
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Col>
        </form>
      </CardBody>
    </Card>
  );
};

export default PersonalInformation;
