import { CSSProperties, ReactNode, useId, useRef } from "react"
import "./WorktreeMenu.css"

// A little rotation on each item so the fanned-out menu doesn't look too rigid.
const JITTER_DEGREES = [-6, 4, -3, 8]

export type WorktreeMenuOption = {
  key: string
  label: string
  content: ReactNode
  className?: string
  onSelect: () => void
}

type WorktreeMenuProps = {
  trigger: (props: {
    popoverTarget: string
    className: string
  }) => ReactNode
  options: WorktreeMenuOption[]
}

export function WorktreeMenu({ trigger: Trigger, options }: WorktreeMenuProps) {
  const id = useId()
  const popoverRef = useRef<HTMLDivElement>(null)

  const close = () => popoverRef.current?.hidePopover()

  return (
    <span className="worktree-menu-anchor">
      <Trigger popoverTarget={id} className="stamp-trigger" />
      <div id={id} ref={popoverRef} className="worktree-menu" popover="auto">
        {options.map(({ key, label, content, className, onSelect }, index) => (
          <button
            key={key}
            aria-label={label}
            className={`worktree-menu-item ${className ?? ""}`}
            style={
              {
                "--angle": `${index * 90}deg`,
                "--jitter": `${JITTER_DEGREES[index]}deg`,
              } as CSSProperties
            }
            onClick={() => {
              onSelect()
              close()
            }}
          >
            {content}
          </button>
        ))}
      </div>
    </span>
  )
}
