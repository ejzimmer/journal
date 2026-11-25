import { ReactNode, useEffect, useRef } from 'react';
import { ReorderControls } from '../todoTypes';

type ReorderableItemProps = {
  className: string;
  label: string;
  reorder: ReorderControls;
  children: ReactNode;
};

export function ReorderableItem({
  className,
  label,
  reorder,
  children,
}: ReorderableItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  // The browser blurs an element when React moves its DOM node to reorder
  // the list.
  useEffect(() => {
    if (!shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    itemRef.current?.focus();
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!reorder.isFirst) {
        shouldRestoreFocusRef.current = true;
        reorder.move(event.shiftKey ? 'start' : 'previous');
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!reorder.isLast) {
        shouldRestoreFocusRef.current = true;
        reorder.move(event.shiftKey ? 'end' : 'next');
      }
    }
  };

  return (
    <div
      ref={itemRef}
      className={className}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
