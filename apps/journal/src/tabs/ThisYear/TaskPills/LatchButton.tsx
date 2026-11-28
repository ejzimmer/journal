import { ReactNode } from 'react';

import './LatchButton.css';

type LatchButtonProps = {
  label: string;
  isPressed: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function LatchButton({
  label,
  isPressed,
  onClick,
  children,
}: LatchButtonProps) {
  return (
    <button
      type="button"
      className="latch-button"
      aria-label={label}
      aria-pressed={isPressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
