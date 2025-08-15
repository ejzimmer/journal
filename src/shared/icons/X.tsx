import { IconProps } from "./types"

export function XIcon({ width = "100%", colour = "currentColor" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      width={width}
    >
      <path d="M3,3 L17,17" />
      <path d="M17,3 L3,17" />
    </svg>
  )
}
