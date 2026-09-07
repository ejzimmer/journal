import { IconProps } from "./types"

export function SpaceInvaderIcon({
  colour = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="-4 -4 64 48"
      width="100%"
      fill="none"
      stroke={colour}
      strokeWidth="4.5"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M8,0 H16 V8 H40 V0 H48 V16 H56 V32 H48 V24 H40 V40 H32
           V32 H24 V40 H16 V24 H8 V32 H0 V16 H8 Z"
      />
    </svg>
  )
}
