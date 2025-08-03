import { useState } from "react"

import "./TaskList.css"

export function Tag({
  text,
  colour,
  onClick,
  onDelete,
}: {
  text: string
  colour: string
  onClick?: () => void
  onDelete?: () => void
}) {
  const [closeButtonVisible, setCloseButtonVisible] = useState(false)
  const showCloseButton = () => setCloseButtonVisible(true)
  const hideCloseButton = () => setCloseButtonVisible(false)

  const style = {
    "--colour": colour,
  } as React.CSSProperties

  return (
    <div
      style={{ position: "absolute" }}
      onMouseEnter={showCloseButton}
      onMouseLeave={hideCloseButton}
    >
      {onClick ? (
        <button className="tag" style={style} onClick={onClick}>
          {text}
        </button>
      ) : (
        <div className="tag" style={style}>
          {text}
        </div>
      )}
      {onDelete && (
        <button
          aria-label={`Delete label ${text}`}
          style={{ ...style, opacity: closeButtonVisible ? 1 : 0 }}
          onClick={onDelete}
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}

export function XIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5,5 L15,15" />
      <path d="M15,5 L5,15" />
    </svg>
  )
}

export const TAG_COLOURS = [
  "hsl(182.8, 91.5%, 72.2%)",
  "hsl(109.8, 91.5%, 72.2%)",
  "hsl(41.8, 87.5%, 74.9%)",
  "hsl(284, 82.4%, 82.2%)",
  "hsl(50.7, 88%, 64.1%)",
]
