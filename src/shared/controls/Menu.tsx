import React, { useId } from 'react';
import { forwardRef, JSX, useImperativeHandle, useRef } from 'react';

import './Menu.css';
import { MenuAction } from './MenuAction';

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
  // A popover is only implicitly anchored to its popovertarget button when
  // a real click or keypress opens it. reopen() opens it programmatically
  // after a keyboard reorder, so the anchor name is set explicitly to keep
  // `anchor()` in Menu.css working either way.
  const anchorName = `--menu-anchor-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const closeMenu = () => {
    dialogRef.current?.hidePopover();
  };

  useImperativeHandle(ref, () => ({
    isOpen: () => dialogRef.current?.matches(':popover-open') ?? false,
    reopen: () => {
      // Hiding and showing again makes the browser recompute the anchored
      // position against the trigger's new place in the list.
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
        role="menu"
        popover="auto"
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        {children({ onClose: closeMenu })}
      </div>
    </div>
  );
});

function Divider() {
  return <hr className="menu-divider" />;
}

const Menu = Object.assign(MenuBase, { Action: MenuAction, Divider });

export { Menu };
