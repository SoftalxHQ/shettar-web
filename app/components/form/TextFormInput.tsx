'use client';

import { type InputHTMLAttributes } from 'react';
import { FormControl, FormGroup, FormLabel, FormText, type FormControlProps } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { type Control, Controller, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form';

export type TextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  id?: string;
  containerClass?: string;
  label?: string;
  helpText?: string;
  placeholder?: string;
  noValidate?: boolean;
  combinedInput?: boolean;
};

const TextFormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  containerClass,
  control,
  helpText,
  id,
  label,
  noValidate,
  combinedInput,
  ...other
}: TextInputProps<TFieldValues> & FormControlProps & InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Controller<TFieldValues, TName>
      name={name as TName}
      defaultValue={'' as PathValue<TFieldValues, TName>}
      control={control}
      render={({ field, fieldState }) =>
        combinedInput ? (
          <FormControl id={id} {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
        ) : (
          <FormGroup className={containerClass ?? ''}>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl id={id} {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
            {helpText && <FormText id={`${id}-help`}>{helpText}</FormText>}
            {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
          </FormGroup>
        )
      }
    />
  );
};

export default TextFormInput;
