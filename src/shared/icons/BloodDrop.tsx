import { IconProps } from "./types"

export function BloodDropIcon({
  width = "100%",
  colour = "#d1263f",
  strokeWidth = "1.5",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <path d="M10 1.7C10 1.7 4.5 9.4 4.5 12.8A5.5 5.5 0 0 0 10 18.3A5.5 5.5 0 0 0 15.5 12.8C15.5 9.4 10 1.7 10 1.7Z" />
    </svg>
  )
}
