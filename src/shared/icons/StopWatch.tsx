import { IconProps } from "./types"

import "./StopWatch.css"

export function StopWatchIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={width}
      stroke={colour}
      strokeWidth="2"
      fill="none"
    >
      <circle cx="10" cy="10" r="9" />
      <line className="watch-hand" x1="10" y1="10" x2="10" y2="2" />
    </svg>
  )
}
