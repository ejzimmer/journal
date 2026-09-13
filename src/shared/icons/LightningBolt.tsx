import { IconProps } from "./types"

export function LightningBoltIcon({
  width = "100%",
  colour = "#2f80ed",
}: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={width} fill={colour}>
      <path d="M11 1 4.5 11.5 9 11.5 8 19 15.5 8 10.5 8Z" />
    </svg>
  )
}
