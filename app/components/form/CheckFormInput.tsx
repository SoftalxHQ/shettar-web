'use client';

import { FormCheck, FormText, type FormCheckProps } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import FormCheckInput from 'react-bootstrap/esm/FormCheckInput';
import FormCheckLabel from 'react-bootstrap/esm/FormCheckLabel';
import { Controller, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form';
import { type TextInputProps } from './TextFormInput';

type CheckFormInputProps = {
  id: string;
  type: 'checkbox' | 'radio';
  labelClassName?: string;
};

const CheckFormInput = <
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
  labelClassName,
  ...other
}: TextInputProps<TFieldValues> & FormCheckProps & CheckFormInputProps) => {
  return (
    <Controller<TFieldValues, TName>
      name={name as TName}
      defaultValue={'' as PathValue<TFieldValues, TName>}
      control={control}
      render={({ field, fieldState }) => (
        <FormCheck className={containerClass ?? ''} id={`form-check-${id ?? name}`}>
          <FormCheckInput {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
          {label && <FormCheckLabel className={labelClassName}>{label}</FormCheckLabel>}
          {helpText && <FormText id={`${id}-help`}>{helpText}</FormText>}
          {!noValidate && fieldState.error?.message && (
            <Feedback type="invalid">{fieldState.error?.message}</Feedback>
          )}
        </FormCheck>
      )}
    />
  );
};

export default CheckFormInput;
