import { IconProps } from "./types"

export function ArrowUpIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill={colour}
    >
      <path d="M7,17 L7,11 2,11 10,3 18,11 13,11 13,17z" />
    </svg>
  )
}
