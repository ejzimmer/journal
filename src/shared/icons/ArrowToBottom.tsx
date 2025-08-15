import { IconProps } from "./types"

export function ArrowToBottomIcon({
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
      <path d="M7,1 L7,8 2,8 10,17 18,8 13,8 13,1z" />
      <path d="M2,18 L18,18" strokeWidth="3" />
    </svg>
  )
}
