import { SVGProps } from "react"

export type IconProps = Omit<
  SVGProps<SVGSVGElement>,
  "width" | "strokeWidth"
> & {
  width?: string
  colour?: string
  strokeWidth?: string
}
