import { IconProps } from "./types"

export function TagIcon({
  width = "100%",
  colour = "hsl(200 80% 50%)",
}: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={width} fill={colour}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2,10 L7,3 L17,3 L17,17 L7,17 Z M11.1,7.5 a1.6,1.6 0 1,0 -3.2,0 a1.6,1.6 0 1,0 3.2,0 Z"
      />
    </svg>
  )
}
