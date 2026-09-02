import { IconProps } from "./types"

export function BracketsIcon({
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
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <polyline points="8,3 5,3 5,17 8,17" />
      <polyline points="12,3 15,3 15,17 12,17" />
    </svg>
  )
}
