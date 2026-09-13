import { ReactNode } from "react"
import { EditableText } from "../../shared/controls/EditableText"

export function Shelf({
  label,
  onRenameLabel,
  single,
  children,
}: {
  label?: string
  onRenameLabel?: (name: string) => void
  single?: boolean
  children: ReactNode
}) {
  return (
    <div className={`shelf${single ? " shelf-single" : ""}`}>
      <div className="spines">{children}</div>
      {label !== undefined && onRenameLabel && (
        <div className="shelf-label">
          <EditableText
            label="Series name"
            value={label}
            onChange={onRenameLabel}
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          />
        </div>
      )}
    </div>
  )
}
