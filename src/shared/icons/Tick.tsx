import { IconProps } from "./types"

export function TickIcon({
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
      fill="none"
    >
      <path d="M2,12 L8,18 18,3" />
    </svg>
  )
}
