import { useEffect, useRef, useState } from 'react';
import { RubbishBinIcon } from '../icons/RubbishBin';
import { DeleteConfirmation } from './DeleteConfirmation';

type DeleteWithConfirmationProps = {
  onDelete: () => void;
  buttonClassName?: string;
  children?: React.ReactNode;
};

export function DeleteWithConfirmation({
  onDelete,
  buttonClassName = '',
  children,
}: DeleteWithConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const wasConfirming = useRef(false);
  const binButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (wasConfirming.current && !isConfirming) {
      binButton.current?.focus();
    }
    wasConfirming.current = isConfirming;
  }, [isConfirming]);

  return isConfirming ? (
    <DeleteConfirmation
      onConfirm={onDelete}
      onCancel={() => setIsConfirming(false)}
      buttonClassName={buttonClassName}
    />
  ) : (
    <>
      <button
        ref={binButton}
        type="button"
        className={`${buttonClassName} delete`}
        aria-label="Delete"
        onClick={() => setIsConfirming(true)}
      >
        <RubbishBinIcon />
      </button>
      {children}
    </>
  );
}
