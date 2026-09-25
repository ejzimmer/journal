import { IconProps } from "./types"

export function EqualIcon({ colour = "currentColor", ...props }: IconProps) {
  return (
    <svg
      stroke={colour}
      fill={colour}
      strokeWidth="2"
      viewBox="0 0 20 20"
      strokeLinejoin="round"
      strokeLinecap="round"
      width="100%"
      {...props}
    >
      <path d="M3,3 l14,0" />
      <path d="M3,10 l14,0" />
    </svg>
  )
}
