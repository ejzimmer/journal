import { IconProps } from "./types"

export function ArrowToStartIcon({
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
      <path d="M10,3 L4,10 10,17" />
      <path d="M18,10 L4,10" />
      <path d="M2,0 L2,18" />
    </svg>
  )
}
