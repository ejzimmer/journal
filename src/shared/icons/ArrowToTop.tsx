import { IconProps } from "./types"

export function ArrowToTopIcon({
  colour = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      width="100%"
      {...props}
    >
      <path d="M4,11 L10,6 16,11" />
      <path d="M10,18 L10,2" />
      <path d="M2,2 L18,2" />
    </svg>
  )
}
