import { IconProps } from "./types"

export function ArrowToEndIcon({
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
      <path d="M10,3 L16,10 10,17" />
      <path d="M2,10 L16,10" />
      <path d="M18,0 L18,18" />
    </svg>
  )
}
