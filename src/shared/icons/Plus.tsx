import { IconProps } from "./types"

export function PlusIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      strokeLinecap="round"
      width={width}
      stroke={colour}
      strokeWidth="2"
      fill="none"
    >
      <line x1="10" y1="2" x2="10" y2="18" />
      <line x1="2" y1="10" x2="18" y2="10" />
    </svg>
  )
}
