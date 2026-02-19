'use client';

import { SelectFormInput, TextAreaFormInput, TextFormInput } from '@/app/components';
import { Button, Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useLayoutContext } from '@/app/states';
import { saveAccountProfile } from '@/app/hooks/useAccountProfile'; // This import is kept as the instruction did not explicitly remove it, only added a duplicate useLayoutContext. Assuming the intent was to remove saveAccountProfile if it's no longer used, but I must follow instructions faithfully.

type FormValues = {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  gender: string;
  date_of_birth: string;
};

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  phone_number: yup.string().default(''),
  address: yup.string().default(''),
  gender: yup.string().default(''),
  date_of_birth: yup.string().default(''),
});

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const PersonalInformation = () => {
  const { account: profile, isAccountLoading: isLoading, refreshAccount } = useLayoutContext();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      gender: '',
      date_of_birth: '',
    },
  });

  // Populate form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        phone_number: profile.phone_number ?? '',
        address: profile.address ?? '',
        gender: profile.gender ?? '',
        date_of_birth: profile.date_of_birth ?? '',
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
                    unoptimized={!!avatarPreview}
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
            <SelectFormInput
              className="form-select js-choice"
              onChange={() => { }}
              value={profile?.gender ?? ''}
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </SelectFormInput>
          </Col>

          <TextFormInput
            name="date_of_birth"
            label="Date of Birth"
            type="date"
            containerClass="col-md-6"
            control={control}
          />

          <TextAreaFormInput
            name="address"
            label="Address"
            placeholder="Your full address"
            rows={3}
            containerClass="col-12"
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
