import { IconProps } from "./types"

export function PauseButtonIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      stroke={colour}
      fill={colour}
      width={width}
      strokeWidth="2"
      viewBox="0 0 20 20"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect x="2" y="2" width="5" height="16" />
      <rect x="12" y="2" width="5" height="16" />
    </svg>
  )
}
