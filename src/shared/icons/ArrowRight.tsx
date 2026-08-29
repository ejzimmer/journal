import { IconProps } from "./types"

export function ArrowRightIcon({
  colour = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      width="100%"
      {...props}
    >
      <path d="M12,3 L18,10 12,17" />
      <path d="M2,10 L18,10" />
    </svg>
  )
}
