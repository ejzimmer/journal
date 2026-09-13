import { CSSProperties } from "react"
import "./ProjectsSkeleton.css"

const SKELETON_CARDS = [
  { colSpan: 18, rowSpan: 1 },
  { colSpan: 24, rowSpan: 2 },
  { colSpan: 15, rowSpan: 1 },
  { colSpan: 20, rowSpan: 1 },
  { colSpan: 16, rowSpan: 2 },
  { colSpan: 22, rowSpan: 1 },
  { colSpan: 14, rowSpan: 1 },
  { colSpan: 19, rowSpan: 1 },
]

export function ProjectsSkeleton() {
  return (
    <>
      {SKELETON_CARDS.map(({ colSpan, rowSpan }, index) => (
        <li
          key={index}
          className="project-item project-skeleton"
          aria-hidden="true"
          style={
            {
              "--col-span": colSpan,
              "--row-span": rowSpan,
            } as CSSProperties
          }
        />
      ))}
    </>
  )
}
