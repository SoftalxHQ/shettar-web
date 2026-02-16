'use client';

import { Options } from 'flatpickr/dist/types/options';
import { useCallback, useEffect, useRef } from 'react';

type FlatpickerProps = {
  className?: string;
  value?: Date | Date[];
  options?: Options;
  placeholder?: string;
  getValue?: (date: Date | Date[]) => void;
};

const Flatpicker = ({ className, options, placeholder, value, getValue }: FlatpickerProps) => {
  const element = useRef<HTMLInputElement | null>(null);
  const instanceRef = useRef<any>(null);
  const getValueRef = useRef(getValue);

  // Keep ref up to date
  useEffect(() => {
    getValueRef.current = getValue;
  }, [getValue]);

  const handleDateChange = useCallback(
    (selectedDates: Date[]) => {
      // In range mode, we should always pass the array to keep the state consistent
      // Only collapse to a single date if NOT in range mode and only one date is present
      const isRange = options?.mode === 'range';
      const newDate = (!isRange && selectedDates.length === 1) ? selectedDates[0] : selectedDates;
      getValueRef.current?.(newDate);
    },
    [options?.mode],
  );

  useEffect(() => {
    let instance: any;
    const initFlatpickr = async () => {
      const { default: flatpickr } = await import('flatpickr');
      if (element.current) {
        instance = flatpickr(element.current, {
          defaultDate: value,
          static: true,
          ...options,
          // Explicitly set closeOnSelect for range mode to prevent premature closing
          closeOnSelect: options?.mode === 'range' ? false : options?.closeOnSelect,
          onChange: (selectedDates, dateStr, inst) => {
            handleDateChange(selectedDates);

            // If range is complete, we can close it if closeOnSelect isn't explicitly false
            if (options?.mode === 'range' && selectedDates.length === 2 && options?.closeOnSelect !== false) {
              inst.close();
            }

            if (options?.onChange) {
              // @ts-expect-error - options.onChange type mismatch
              options.onChange(selectedDates, dateStr, inst);
            }
          },
        });
        instanceRef.current = instance;
      }
    };
    initFlatpickr();

    return () => {
      instance?.destroy();
      instanceRef.current = null;
    };
    // Only re-init if specific critical options change, or if we really need to.
    // Adding options?.mode and options?.closeOnSelect specifically.
  }, [options?.mode, options?.closeOnSelect, handleDateChange]);

  useEffect(() => {
    if (instanceRef.current && value) {
      // Only update if the dates are actually different to avoid resetting internal state
      const currentDate = instanceRef.current.selectedDates;
      const isSame = Array.isArray(value)
        ? value.length === currentDate.length && value.every((d, i) => d.getTime() === currentDate[i]?.getTime())
        : value instanceof Date && currentDate.length === 1 && value.getTime() === currentDate[0]?.getTime();

      if (!isSame) {
        instanceRef.current.setDate(value, false);
      }
    }
  }, [value]);

  return <input ref={element} data-input className={`form-control flatpickr w-100 ${className}`} placeholder={placeholder} />;
};

export default Flatpicker;
