import { ReactNode } from 'react';
import { EditableText } from '../../shared/controls/EditableText';

type ShelfProps = {
  label?: string;
  onRenameLabel?: (name: string) => void;
  single?: boolean;
  children: ReactNode;
};

export function Shelf({ label, onRenameLabel, single, children }: ShelfProps) {
  return (
    <div className={`shelf${single ? ' shelf-single' : ''}`}>
      <div className="spines">{children}</div>
      {label !== undefined && onRenameLabel && (
        <div className="shelf-label">
          <EditableText
            label="Series name"
            value={label}
            onChange={onRenameLabel}
          />
        </div>
      )}
    </div>
  );
}
