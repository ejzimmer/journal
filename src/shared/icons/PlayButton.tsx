import { IconProps } from "./types"

export function PlayButtonIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      stroke={colour}
      fill="none"
      width={width}
      strokeWidth="2"
      viewBox="0 0 20 20"
    >
      <circle cx="10" cy="10" r="9" />
      <path d="M7,6 L7,14 14,10z" />
    </svg>
  )
}
