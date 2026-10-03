import { ReactNode } from 'react';
import { EditableText } from '../../shared/controls/EditableText';

export function Shelf({
  label,
  onRenameLabel,
  labelAction,
  single,
  children,
}: {
  label?: string;
  onRenameLabel?: (name: string) => void;
  labelAction?: ReactNode;
  single?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`shelf${single ? ' shelf-single' : ''}`}>
      <div className="spines">{children}</div>
      {label !== undefined && onRenameLabel && (
        <div className="shelf-label-row">
          <div className="shelf-label">
            <EditableText
              label="Series name"
              value={label}
              onChange={onRenameLabel}
            />
          </div>
          {labelAction}
        </div>
      )}
    </div>
  );
}
