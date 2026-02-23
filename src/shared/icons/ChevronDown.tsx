import { IconProps } from "./types"

export function ChevronDownIcon({
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
      <path d="M3,10 L10,16 17,10" />
    </svg>
  )
}
