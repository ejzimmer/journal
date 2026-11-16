import { ReactNode, useRef } from 'react';

import './Drawer.css';
import { useDrawer } from './useDrawer';

type DrawerProps = {
  isOpen: boolean;
  className?: string;
  children: ReactNode;
};

export function Drawer({ isOpen, className, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { height, isRaised, isSettled } = useDrawer({
    drawerRef,
    contentRef,
    isOpen,
  });

  const classNames = [
    'drawer',
    className,
    isOpen && 'open',
    isRaised && 'raised',
    isSettled && 'settled',
  ].filter(Boolean);

  return (
    <div
      className={classNames.join(' ')}
      style={{ height }}
      ref={drawerRef}
      inert={!isOpen}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
