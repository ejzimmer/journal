import { CSSProperties, useRef } from 'react';

import './StatusPicker.css';

export type StatusPickerOption<S extends string> = {
  status: S;
  glyph: string;
};

type StatusPickerProps<S extends string> = {
  id: string;
  anchorName: string;
  options: StatusPickerOption<S>[];
  onSelect: (status: S) => void;
};

export function StatusPicker<S extends string>({
  id,
  anchorName,
  options,
  onSelect,
}: StatusPickerProps<S>) {
  const popoverRef = useRef<HTMLDivElement>(null);

  return (
    <div
      id={id}
      ref={popoverRef}
      className="status-picker"
      popover="auto"
      style={{ positionAnchor: anchorName } as CSSProperties}
    >
      {options.map(({ status, glyph }) => (
        <button
          key={status}
          aria-label={status}
          onClick={() => {
            popoverRef.current?.hidePopover();
            onSelect(status);
          }}
        >
          {glyph}
        </button>
      ))}
    </div>
  );
}
