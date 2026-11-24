import { ReactNode, useEffect, useRef } from 'react';
import { ReorderControls } from './ReorderControls';

type ReorderableGroupProps = {
  className: string;
  label: string;
  reorder: ReorderControls;
  children: ReactNode;
};

export function ReorderableGroup({
  className,
  label,
  reorder,
  children,
}: ReorderableGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  // React keeps this instance across a reorder because the list is keyed by
  // task id, but moving the element in the DOM drops its focus.
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    groupRef.current?.focus();
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
      ref={groupRef}
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
