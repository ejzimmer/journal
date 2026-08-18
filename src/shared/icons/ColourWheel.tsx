import { IconProps } from "./types"

export function ColourWheelIcon({ width = "100%" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={width}>
      <path d="M10,10 L10,2 A8,8 0 0,1 16.93,6 Z" fill="#e74c3c" />
      <path d="M10,10 L16.93,6 A8,8 0 0,1 16.93,14 Z" fill="#f1c40f" />
      <path d="M10,10 L16.93,14 A8,8 0 0,1 10,18 Z" fill="#2ecc71" />
      <path d="M10,10 L10,18 A8,8 0 0,1 3.07,14 Z" fill="#3498db" />
      <path d="M10,10 L3.07,14 A8,8 0 0,1 3.07,6 Z" fill="#9b59b6" />
      <path d="M10,10 L3.07,6 A8,8 0 0,1 10,2 Z" fill="#e67e22" />
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
      />
    </svg>
  )
}
