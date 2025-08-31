import { IconProps } from "./types"

export function ArrowUpIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <path d="M3,8 L10,2 17,8" />
      <path d="M10,2 L10,18" />
    </svg>
  )
}
