import { useState } from 'react';

export const useToggle = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, toggle, open, close, setIsOpen };
};
