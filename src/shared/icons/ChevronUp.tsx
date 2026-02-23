import { IconProps } from "./types"

export function ChevronUpIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <path d="M3,12 L10,6 17,12" />
    </svg>
  )
}
