import { Worktree, WORKTREES } from "../types"
import { Stamp } from "./Stamp"
import { WorktreeMenu, WorktreeMenuOption } from "./WorktreeMenu"

type AddWorktreeProps = {
  onChange: (worktree: Worktree) => void
}

export function AddWorktree({ onChange }: AddWorktreeProps) {
  const options: WorktreeMenuOption[] = WORKTREES.map(
    (worktree): WorktreeMenuOption => ({
      key: worktree,
      label: `Add ${worktree.toUpperCase()} stamp`,
      content: <Stamp worktree={worktree} />,
      onSelect: () => onChange(worktree),
    }),
  )

  return (
    <WorktreeMenu
      trigger={(props) => (
        <button
          {...props}
          className={`${props.className} add-metadata`}
          aria-label="Add worktree stamp"
        >
          <Stamp />
        </button>
      )}
      options={options}
    />
  )
}
