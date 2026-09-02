import { IconProps } from "./types"

export function BracketsIcon({ colour = "currentColor", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 25"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      {...props}
    >
      <polyline points="8,2 5,2 5,23 8,23" />
      <polyline points="12,2 15,2 15,23 12,23" />
    </svg>
  )
}
