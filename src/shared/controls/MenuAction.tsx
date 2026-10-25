import React from 'react';

type MenuActionProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
> & {
  isDisabled?: boolean;
  onClick: (event: React.MouseEvent) => void;
};

export function MenuAction({
  isDisabled,
  children,
  ...props
}: MenuActionProps) {
  return (
    <button {...props} role="menuitem" disabled={isDisabled}>
      {children}
    </button>
  );
}
