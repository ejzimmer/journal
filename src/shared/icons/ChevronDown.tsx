import { IconProps } from "./types"

export function ChevronDownIcon({
  colour = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      width="100%"
      {...props}
    >
      <path d="M3,10 L10,16 17,10" />
    </svg>
  )
}
