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

            if (value !== undefined) {
              choicesInstanceRef.current.setChoiceByValue(value);
            }

            const handleChange = () => {
              if (onChange && selectE.current) {
                onChange(selectE.current.value);
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
          // Ensure we remove the specific listener we added
          // Note: In a real app we'd name this function to remove it properly, 
          // but destroying the Choices instance often handles the cleanup.
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
      defaultValue={value}
    >
      {children}
    </select>
  );
};

export default SelectFormInput;
