import { IconProps } from "./types"

export function ArrowToTopIcon({
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
      <path d="M2,2 L18,2" strokeWidth="3" />
      <path d="M7,18 L7,12 2,12 10,4 18,12 13,12 13,18z" />
    </svg>
  )
}
