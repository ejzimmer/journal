import { IconProps } from "./types"

export function EllipsisIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg viewBox="0 0 30 10" stroke={colour} width={width}>
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="15" cy="5" r="2.5" />
      <circle cx="25" cy="5" r="2.5" />
    </svg>
  )
}
