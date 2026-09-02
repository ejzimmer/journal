import { IconProps } from "./types"

export function BracketsIcon({ colour = "currentColor", ...props }: IconProps) {
  const width = props.width ?? "100%"
  const strokeWidth = props.strokeWidth ?? "2"

  return (
    <svg
      viewBox="0 0 20 25"
      stroke={colour}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <polyline points="8,2 5,2 5,23 8,23" />
      <polyline points="12,2 15,2 15,23 12,23" />
    </svg>
  )
}
