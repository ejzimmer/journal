import {
  CSSProperties,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import "./WorktreeMenu.css"

// Starting tilt for each item (by position), so they don't all fly out
// from the same angle when the menu opens.
const JITTER_DEGREES = [-6, 4, -3, 8]

// Below this much space to the left, the full circle would spill off the
// page, so the menu switches to a half-circle on the right instead.
const LEFT_EDGE_THRESHOLD_PX = 90

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
  const anchorRef = useRef<HTMLSpanElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<"full" | "half">("full")

  const close = () => popoverRef.current?.hidePopover()

  useEffect(() => {
    const popover = popoverRef.current
    const anchor = anchorRef.current
    if (!popover || !anchor) return

    const onBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState !== "open") return
      const { left } = anchor.getBoundingClientRect()
      setLayout(left < LEFT_EDGE_THRESHOLD_PX ? "half" : "full")
    }

    popover.addEventListener("beforetoggle", onBeforeToggle)
    return () => popover.removeEventListener("beforetoggle", onBeforeToggle)
  }, [])

  return (
    <span className="worktree-menu-anchor" ref={anchorRef}>
      <Trigger popoverTarget={id} className="stamp-trigger" />
      <div
        id={id}
        ref={popoverRef}
        className="worktree-menu"
        data-layout={layout}
        popover="auto"
      >
        {options.map(({ key, label, content, className, onSelect }, index) => (
          <button
            key={key}
            aria-label={label}
            className={`worktree-menu-item ${className ?? ""}`}
            style={
              {
                "--index": index,
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
