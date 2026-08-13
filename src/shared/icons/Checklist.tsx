import { IconProps } from "./types"

export function ChecklistIcon({
  width = "100%",
  colour = "currentColor",
  strokeWidth = "2",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <path d="M2,4.5 L3.5,6 L6,3" />
      <line x1="8.5" y1="4.5" x2="18" y2="4.5" />
      <path d="M2,10.5 L3.5,12 L6,9" />
      <line x1="8.5" y1="10.5" x2="18" y2="10.5" />
      <path d="M2,16.5 L3.5,18 L6,15" />
      <line x1="8.5" y1="16.5" x2="18" y2="16.5" />
    </svg>
  )
}
