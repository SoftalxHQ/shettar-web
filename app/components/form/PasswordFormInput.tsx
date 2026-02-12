'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { FormControl, FormGroup, FormLabel, FormText, type FormControlProps } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { type TextInputProps } from './TextFormInput';

const PasswordFormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  containerClass,
  control,
  helpText,
  id,
  label,
  noValidate,
  ...other
}: TextInputProps<TFieldValues> & FormControlProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller<TFieldValues, TName>
      name={name as TName}
      defaultValue={'' as PathValue<TFieldValues, TName>}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup className={clsx('position-relative', containerClass ?? '')}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl
            id={id}
            type={showPassword ? 'text' : 'password'}
            isInvalid={Boolean(fieldState.error?.message)}
            {...other}
            {...field}
          />
          <span
            className="position-absolute top-50 end-0 translate-middle-y pe-2 mt-3"
            onClick={() => setShowPassword(!showPassword)}
            role="button"
          >
            {!fieldState.error &&
              (showPassword ? (
                <FaEyeSlash size={18} className="cursor-pointer" />
              ) : (
                <FaEye size={18} className="cursor-pointer" />
              ))}
          </span>
          {helpText && <FormText id={`${id}-help`}>{helpText}</FormText>}
          {!noValidate && fieldState.error?.message && (
            <Feedback type="invalid">{fieldState.error?.message}</Feedback>
          )}
        </FormGroup>
      )}
    />
  );
};

export default PasswordFormInput;
