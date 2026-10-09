import { useState } from 'react';
import { RubbishBinIcon } from '../icons/RubbishBin';

type DeleteWithConfirmationProps = {
  onDelete: () => void;
  className?: string;
};

export function DeleteWithConfirmation({
  onDelete,
  className = '',
}: DeleteWithConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <button
      type="button"
      className={`${className} delete ${isConfirming ? 'confirming' : ''}`}
      aria-label={isConfirming ? 'Confirm delete' : 'Delete'}
      onClick={() => (isConfirming ? onDelete() : setIsConfirming(true))}
      onBlur={() => setIsConfirming(false)}
    >
      <RubbishBinIcon />
    </button>
  );
}
