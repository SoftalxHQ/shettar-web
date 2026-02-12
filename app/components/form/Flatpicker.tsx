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

  const handleDateChange = useCallback(
    (selectedDates: Date[]) => {
      const newDate = selectedDates.length === 1 ? selectedDates[0] : selectedDates;
      getValue?.(newDate);
    },
    [getValue],
  );

  useEffect(() => {
    const initFlatpickr = async () => {
      // Dynamic import to avoid "document is not defined" during SSR
      const { default: flatpickr } = await import('flatpickr');
      if (element.current) {
        const instance = flatpickr(element.current, {
          defaultDate: value,
          ...options,
          closeOnSelect: false, // Force false initially to control closing manually in onChange
          onChange: (selectedDates, dateStr, instance) => {
            // Call internal handler
            handleDateChange(selectedDates);

            // Call user provided onChange if exists
            if (options?.onChange) {
              // @ts-expect-error - options.onChange type mismatch
              options.onChange(selectedDates, dateStr, instance);
            }

            // Custom closing logic
            // If user explicitly set closeOnSelect: false, respect it and never close automatically
            if (options?.closeOnSelect === false) {
              return;
            }

            // Default behavior: Close on single date or full range
            if (options?.mode === 'range') {
              if (selectedDates.length === 2) {
                instance.close();
              }
            } else {
              instance.close();
            }
          },
        });

        return () => {
          instance.destroy();
        };
      }
    };
    initFlatpickr();
  }, [value, options, handleDateChange]);

  return <input ref={element} className={`form-control flatpickr ${className}`} placeholder={placeholder} />;
};

export default Flatpicker;
