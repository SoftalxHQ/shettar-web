'use client';

import { FormControl, FormGroup, FormLabel, FormText, type FormControlProps } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form';
import { type TextInputProps } from './TextFormInput';

type TextAreaFormInputProps = {
  rows?: number;
};

const TextAreaFormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  rows = 3,
  containerClass,
  control,
  helpText,
  id,
  label,
  noValidate,
  ...other
}: TextInputProps<TFieldValues> & FormControlProps & TextAreaFormInputProps) => {
  return (
    <Controller<TFieldValues, TName>
      name={name as TName}
      defaultValue={'' as PathValue<TFieldValues, TName>}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup className={containerClass ?? ''}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl id={id} rows={rows} as="textarea" {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
          {helpText && <FormText id={`${id}-help`}>{helpText}</FormText>}
          {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
        </FormGroup>
      )}
    />
  );
};

export default TextAreaFormInput;
