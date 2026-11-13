import { ReactNode, useRef } from 'react';
import { flushSync } from 'react-dom';
import { ClassKind } from './ClassKindSwitch';

type ClassKindRowProps = {
  kind: ClassKind;
  isSelected: boolean;
  onSelect: (kind: ClassKind) => void;
  children: ReactNode;
};

export function ClassKindRow({
  kind,
  isSelected,
  onSelect,
  children,
}: ClassKindRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const selectRow = () => {
    flushSync(() => onSelect(kind));
    rowRef.current?.querySelector('input')?.focus();
  };

  return (
    <div
      ref={rowRef}
      className={`class-kind-row ${isSelected ? '' : 'unselected'}`}
      onClick={isSelected ? undefined : selectRow}
    >
      {children}
    </div>
  );
}
