import { useEffect, useRef } from 'react';
import { TickIcon } from '../icons/Tick';
import { XIcon } from '../icons/X';

type DeleteConfirmationProps = {
  onConfirm: () => void;
  onCancel: () => void;
  buttonClassName?: string;
};

export function DeleteConfirmation({
  onConfirm,
  onCancel,
  buttonClassName = '',
}: DeleteConfirmationProps) {
  const confirmButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButton.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={confirmButton}
        type="button"
        className={`${buttonClassName} confirm-delete`}
        aria-label="Confirm delete"
        onClick={onConfirm}
      >
        <TickIcon />
      </button>
      <button
        type="button"
        className={`${buttonClassName} cancel-delete`}
        aria-label="Cancel delete"
        onClick={onCancel}
      >
        <XIcon />
      </button>
    </>
  );
}
