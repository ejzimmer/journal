import { CSSProperties, ReactNode } from "react"

import "./Spine.css"

export function Spine({
  status,
  hue,
  bandHue,
  minHeight,
  title,
  author,
  glyph,
  titleAriaLabel,
  stampAriaLabel,
  onTitleClick,
  onStampClick,
  children,
}: {
  status: "todo" | "active" | "done"
  hue: number
  bandHue?: number
  minHeight: number
  title: string
  author?: string
  glyph: string
  titleAriaLabel: string
  stampAriaLabel: string
  onTitleClick: () => void
  onStampClick: () => void
  children?: ReactNode
}) {
  return (
    <li
      className={`spine ${status}`}
      style={
        {
          "--hue": hue,
          ...(bandHue !== undefined && { "--band-hue": bandHue }),
          minHeight,
        } as CSSProperties
      }
    >
      {bandHue !== undefined && (
        <span className="series-band series-band-head" />
      )}

      <button
        className="title"
        aria-label={titleAriaLabel}
        onClick={onTitleClick}
      >
        <span className="spine-label">
          <span className="title-text">{title}</span>
          {author && <span className="author">{author}</span>}
        </span>
      </button>

      <button
        className="stamp"
        aria-label={stampAriaLabel}
        onClick={onStampClick}
      >
        {glyph}
      </button>

      {bandHue !== undefined && (
        <span className="series-band series-band-tail" />
      )}

      {children}
    </li>
  )
}
