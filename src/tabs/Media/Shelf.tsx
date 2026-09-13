import { ReactNode } from "react"
import { EditableText } from "../../shared/controls/EditableText"

export function Shelf({
  label,
  onRenameLabel,
  children,
}: {
  label?: string
  onRenameLabel?: (name: string) => void
  children: ReactNode
}) {
  return (
    <div className="shelf">
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
  )
}
