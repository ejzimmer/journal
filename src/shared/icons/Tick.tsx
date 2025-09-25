import { IconProps } from "./types"

export function TickIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      width={width}
      fill="none"
    >
      <path d="M2,12 L8,18 18,3" />
    </svg>
  )
}
