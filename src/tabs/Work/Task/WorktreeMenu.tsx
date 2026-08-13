import { ReactNode, useId, useRef } from "react"
import "./WorktreeMenu.css"

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
            className={`worktree-menu-item slot-${index + 1} ${className ?? ""}`}
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
