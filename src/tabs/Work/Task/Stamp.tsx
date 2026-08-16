import { Worktree } from "../types"
import "./Stamp.css"

type StampProps = {
  worktree?: Worktree
  // The jaunty tilt only makes sense once a worktree has actually been
  // stamped onto a task, not while it's just an option in the menu.
  rotated?: boolean
}

export function Stamp({ worktree, rotated }: StampProps) {
  const label = worktree ? worktree.toUpperCase().replace("-", "") : "WT"
  return (
    <span
      className={`stamp ${worktree ?? "blank"} ${rotated ? "rotated" : ""}`}
    >
      {label}
    </span>
  )
}
