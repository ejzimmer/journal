import { IconProps } from "./types"

export function ArrowToTopIcon({
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
      <path d="M4,11 L10,6 16,11" />
      <path d="M10,18 L10,2" />
      <path d="M2,2 L18,2" />
    </svg>
  )
}
