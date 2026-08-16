import { Worktree } from "../types"
import "./Stamp.css"

type StampProps = {
  worktree?: Worktree
}

export function Stamp({ worktree }: StampProps) {
  return (
    <span className={`stamp ${worktree ?? "blank"}`}>
      {worktree ? worktree.toUpperCase() : "WT"}
    </span>
  )
}
