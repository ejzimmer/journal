import { RubbishBinIcon } from "../../../shared/icons/RubbishBin"
import { Worktree, WORKTREES } from "../types"
import { Stamp } from "./Stamp"
import { WorktreeMenu, WorktreeMenuOption } from "./WorktreeMenu"

type WorktreeStampProps = {
  worktree: Worktree
  onChange: (worktree?: Worktree) => void
}

export function WorktreeStamp({ worktree, onChange }: WorktreeStampProps) {
  const options: WorktreeMenuOption[] = [
    ...WORKTREES.filter((other) => other !== worktree).map(
      (other): WorktreeMenuOption => ({
        key: other,
        label: `Move to ${other.toUpperCase()}`,
        content: <Stamp worktree={other} />,
        onSelect: () => onChange(other),
      }),
    ),
    {
      key: "remove",
      label: "Remove worktree stamp",
      className: "remove",
      content: <RubbishBinIcon width="18px" colour="currentColor" />,
      onSelect: () => onChange(undefined),
    },
  ]

  return (
    <WorktreeMenu
      trigger={(props) => (
        <button
          {...props}
          aria-label={`Change worktree, currently ${worktree.toUpperCase()}`}
        >
          <Stamp worktree={worktree} rotated />
        </button>
      )}
      options={options}
    />
  )
}
