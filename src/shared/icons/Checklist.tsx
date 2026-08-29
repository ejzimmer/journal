import { IconProps } from "./types"

export function ChecklistIcon({
  colour = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth={2}
      strokeLinecap="round"
      fill={colour}
      width="100%"
      {...props}
    >
      <circle cx="3" cy="4.5" r="1.5" stroke="none" />
      <line x1="8" y1="4.5" x2="18" y2="4.5" />
      <circle cx="3" cy="10" r="1.5" stroke="none" />
      <line x1="8" y1="10" x2="18" y2="10" />
      <circle cx="3" cy="15.5" r="1.5" stroke="none" />
      <line x1="8" y1="15.5" x2="18" y2="15.5" />
    </svg>
  )
}
