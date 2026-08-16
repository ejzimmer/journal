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
        d="M1.45,9 L5.45,3 L21.45,3 L21.45,15 L5.45,15 Z M7.75,9 a1.8,1.8 0 1,0 -3.6,0 a1.8,1.8 0 1,0 3.6,0 Z"
      />
    </svg>
  )
}
