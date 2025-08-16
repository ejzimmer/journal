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
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M4,4 L16,10 4,16" />
    </svg>
  )
}
