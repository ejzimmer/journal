import { IconProps } from "./types"

export function ChecklistIcon({
  width = "100%",
  colour = "currentColor",
  strokeWidth = "2",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      width={width}
      fill={colour}
    >
      <circle cx="3" cy="4.5" r="1.5" stroke="none" />
      <line x1="8" y1="4.5" x2="18" y2="4.5" />
      <circle cx="3" cy="10" r="1.5" stroke="none" />
      <line x1="8" y1="10" x2="18" y2="10" />
      <circle cx="3" cy="15.5" r="1.5" stroke="none" />
      <line x1="8" y1="15.5" x2="18" y2="15.5" />
    </svg>
  )
}
