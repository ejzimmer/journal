import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export function useFormToggle<T extends HTMLElement = HTMLButtonElement>() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const triggerRef = useRef<T>(null);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => {
    flushSync(() => setIsFormOpen(false));
    triggerRef.current?.focus();
  };

  const toggleForm = () => {
    if (isFormOpen) {
      closeForm();
    } else {
      openForm();
    }
  };

  const closeFormOnEscape = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeForm();
    }
  };

  const openFormOnEnterOrSpace = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openForm();
    }
  };

  return {
    isFormOpen,
    triggerRef,
    openForm,
    closeForm,
    toggleForm,
    closeFormOnEscape,
    openFormOnEnterOrSpace,
  };
}
