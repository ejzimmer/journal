import { IconProps } from "./types"

export function TagIcon({
  width = "100%",
  colour = "hsl(200 80% 50%)",
}: IconProps) {
  return (
    <svg viewBox="0 0 24 18" width={width} fill={colour}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2,9 L6,3 L22,3 L22,15 L6,15 Z M15.6,9 a1.6,1.6 0 1,0 -3.2,0 a1.6,1.6 0 1,0 3.2,0 Z"
      />
    </svg>
  )
}
