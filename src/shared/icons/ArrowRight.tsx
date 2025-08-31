import { IconProps } from "./types"

export function ArrowRightIcon({
  width = "100%",
  colour = "currentColor",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      fill="none"
    >
      <path d="M12,3 L18,10 12,17" />
      <path d="M2,10 L18,10" />
    </svg>
  )
}
