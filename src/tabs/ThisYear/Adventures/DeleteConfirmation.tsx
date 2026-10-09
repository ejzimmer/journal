import { useEffect, useRef } from 'react';
import { TickIcon } from '../../../shared/icons/Tick';
import { XIcon } from '../../../shared/icons/X';

type DeleteConfirmationProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmation({
  onConfirm,
  onCancel,
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
        className="ghost confirm-delete"
        aria-label="Confirm delete"
        onClick={onConfirm}
      >
        <TickIcon width="16px" />
      </button>
      <button
        type="button"
        className="ghost"
        aria-label="Cancel delete"
        onClick={onCancel}
      >
        <XIcon width="14px" />
      </button>
    </>
  );
}
