import { IconProps } from "./types"

export function SortIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <path d="M2,6 L5,2 8,6" />
      <path d="M5,2 L5,15" />
      <path d="M12,14 L15,18 18,14" />
      <path d="M15,5 L15,18" />
    </svg>
  )
}
