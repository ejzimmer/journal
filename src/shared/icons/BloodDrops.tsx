import { IconProps } from "./types"

export function BloodDropsIcon({
  width = "100%",
  colour = "#d1263f",
}: IconProps) {
  return (
    <svg viewBox="0 0 26 20" width={width} fill={colour}>
      <path d="M8 1.7C8 1.7 2.5 9.4 2.5 12.8A5.5 5.5 0 0 0 8 18.3A5.5 5.5 0 0 0 13.5 12.8C13.5 9.4 8 1.7 8 1.7Z" />
      <path
        d="M17 4.2C17 4.2 12.5 10.7 12.5 13.6A4.5 4.5 0 0 0 17 18.1A4.5 4.5 0 0 0 21.5 13.6C21.5 10.7 17 4.2 17 4.2Z"
        stroke="#fff"
        strokeWidth="1"
      />
    </svg>
  )
}
