import { IconProps } from "./types"

export function ArrowDownIcon({
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
      <path d="M7,2 L7,9 2,9 10,18 18,9 13,9 13,2z" />
    </svg>
  )
}
