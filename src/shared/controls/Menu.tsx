import React, { useId } from 'react';
import { forwardRef, JSX, useImperativeHandle, useRef } from 'react';

import './Menu.css';

type MenuChildrenProps = {
  onClose: () => void;
};

type MenuProps = {
  trigger: (props: MenuTriggerProps) => JSX.Element;
  children: (props: MenuChildrenProps) => React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
};

type MenuTriggerProps = {
  popoverTarget: string;
  style: React.CSSProperties;
};

export type MenuHandle = {
  isOpen: () => boolean;
  reopen: () => void;
};

const MenuBase = forwardRef<MenuHandle, MenuProps>(function Menu(
  { trigger, children, onKeyDown },
  ref,
) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const anchorName = `--menu-anchor-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const closeMenu = () => {
    dialogRef.current?.hidePopover();
  };

  useImperativeHandle(ref, () => ({
    isOpen: () => dialogRef.current?.matches(':popover-open') ?? false,
    reopen: () => {
      dialogRef.current?.hidePopover();
      dialogRef.current?.showPopover();
    },
  }));

  return (
    <div style={{ position: 'relative' }} onKeyDown={onKeyDown}>
      {trigger({
        popoverTarget: id,
        style: { anchorName } as React.CSSProperties,
      })}
      <div
        id={id}
        ref={dialogRef}
        className="menu"
        popover="auto"
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        {children({ onClose: closeMenu })}
      </div>
    </div>
  );
});

function Action({
  isDisabled,
  children,
  ...props
}: Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
> & {
  isDisabled?: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button {...props} role="menuitem" disabled={isDisabled}>
      {children}
    </button>
  );
}

function Divider() {
  return <hr className="menu-divider" />;
}

const Menu = Object.assign(MenuBase, { Action, Divider });

export { Menu };
