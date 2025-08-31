import { IconProps } from "./types"

export function ArrowToBottomIcon({
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
      <path d="M4,9 L10,14 16,9" />
      <path d="M10,2 L10, 18" />
      <path d="M2,18 L18,18" strokeWidth="4" />
    </svg>
  )
}
