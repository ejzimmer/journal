import { ReactNode } from "react"

export function DefaultOption<T extends { text: string }>({
  option,
  children,
}: {
  option: T
  children?: ReactNode
}) {
  return (
    <>
      {option.text} {children}
    </>
  )
}
