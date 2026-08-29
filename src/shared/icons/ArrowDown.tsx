import { IconProps } from "./types"

export function ArrowDownIcon({
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
      <path d="M3,12 L10,18 17,12" />
      <path d="M10,2 L10,18" />
    </svg>
  )
}
