'use client';

import { type Options as ChoiceOption } from 'choices.js';
import { type ReactNode, useEffect, useRef } from 'react';

export type ChoiceProp = Partial<ChoiceOption> & {
  children: ReactNode;
  multiple?: boolean;
  className?: string;
  onChange?: (text: string) => void;
  value?: string | string[];
};

const SelectFormInput = ({ children, multiple, className, onChange, value, ...choiceOptions }: ChoiceProp) => {
  const selectE = useRef<HTMLSelectElement>(null);
  const choicesInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initChoices = async () => {
      if (!selectE.current) return;

      // Check if already initialized by looking for the wrapper
      // Choices.js adds a .choices class to the wrapper it creates.
      // More reliably, it adds a property to the element itself usually, but class check is common.
      if (selectE.current.dataset.choicesInitialized === 'true') {
        return;
      }

      const { default: Choices } = await import('choices.js');

      if (selectE.current && isMounted) {
        try {
          // Double check before creating new instance
          if (selectE.current.dataset.choicesInitialized !== 'true') {
            choicesInstanceRef.current = new Choices(selectE.current, {
              ...choiceOptions,
              allowHTML: true,
              shouldSort: false,
            });
            selectE.current.dataset.choicesInitialized = 'true';

            const handleChange = (e: Event) => {
              if (onChange && e.target instanceof HTMLSelectElement) {
                onChange(e.target.value);
              }
            };

            selectE.current.addEventListener('change', handleChange);
          }
        } catch (error) {
          // If it fails because it's already initialized, we just ignore it
          if (error instanceof Error && error.message.includes('already initialised')) {
            return;
          }
          console.error('Choices initialization failed:', error);
        }
      }
    };

    initChoices();

    return () => {
      isMounted = false;
      if (choicesInstanceRef.current) {
        if (selectE.current) {
          selectE.current.dataset.choicesInitialized = 'false';
        }
        choicesInstanceRef.current.destroy();
        choicesInstanceRef.current = null;
      }
    };
  }, [onChange, JSON.stringify(choiceOptions)]);

  useEffect(() => {
    if (choicesInstanceRef.current && value !== undefined) {
      choicesInstanceRef.current.setChoiceByValue(value);
    }
  }, [value]);

  return (
    <select
      ref={selectE}
      multiple={multiple}
      className={className}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {children}
    </select>
  );
};

export default SelectFormInput;
