'use client';

import { type Options as ChoiceOption } from 'choices.js';
import { type ReactElement, useEffect, useRef } from 'react';

export type ChoiceProp = Partial<ChoiceOption> & {
  children: ReactElement[];
  multiple?: boolean;
  className?: string;
  onChange?: (text: string) => void;
};

const SelectFormInput = ({ children, multiple, className, onChange, ...choiceOptions }: ChoiceProp) => {
  const selectE = useRef<HTMLSelectElement>(null);
  const choicesInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initChoices = async () => {
      if (!selectE.current || isInitializingRef.current) return;

      // Check if already has a choices wrapper or instance
      if (selectE.current.classList.contains('choices__input') || (selectE.current as any).choices) {
        return;
      }

      isInitializingRef.current = true;
      const { default: Choices } = await import('choices.js');

      if (selectE.current && isMounted) {
        try {
          if (!selectE.current.classList.contains('choices__input')) {
            choicesInstanceRef.current = new Choices(selectE.current, {
              ...choiceOptions,
              allowHTML: true,
              shouldSort: false,
            });

            const handleChange = (e: Event) => {
              if (onChange && e.target instanceof HTMLSelectElement) {
                onChange(e.target.value);
              }
            };

            selectE.current.addEventListener('change', handleChange);
          }
        } catch (error) {
          console.error('Choices initialization failed:', error);
        }
      }
      isInitializingRef.current = false;
    };

    initChoices();

    return () => {
      isMounted = false;
      if (choicesInstanceRef.current) {
        choicesInstanceRef.current.destroy();
        choicesInstanceRef.current = null;
      }
    };
  }, [onChange, JSON.stringify(choiceOptions)]);

  return (
    <select ref={selectE} multiple={multiple} className={className}>
      {children}
    </select>
  );
};

export default SelectFormInput;
