import { FormEvent, useEffect, useId, useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { TickIcon } from "../../../shared/icons/Tick"
import { XIcon } from "../../../shared/icons/X"

type CalorieFormProps = {
  date: { day: number; month: string }
  consumed?: number
  expended?: number
  shouldShow: boolean
  onSubmit: ({
    consumed,
    expended,
  }: {
    consumed: number
    expended: number
  }) => void
}

export function CalorieForm({
  date,
  consumed,
  expended,
  shouldShow,
  onSubmit,
}: CalorieFormProps) {
  const [popoverDismissed, setPopoverDismissed] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const dateHeadingId = useId()

  useEffect(() => {
    const popover = popoverRef.current
    if (!popover) {
      return
    }

    const isOpen = popover.matches(":popover-open")
    if (shouldShow && !popoverDismissed && !isOpen) {
      popover.showPopover()
    }
  }, [shouldShow, popoverDismissed])

  const dismiss = () => {
    setPopoverDismissed(true)
    popoverRef.current?.hidePopover()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const [consumedElement, expendedElement] = (event.target as HTMLFormElement)
      .elements

    const consumedInput = consumedElement as HTMLInputElement
    const expendedInput = expendedElement as HTMLInputElement

    if (!consumedInput.value || !expendedInput.value) {
      return
    }

    onSubmit({
      consumed: Number.parseInt(consumedInput.value),
      expended: Number.parseInt(expendedInput.value),
    })
    popoverRef.current?.hidePopover()
  }

  return (
    <div
      ref={popoverRef}
      popover="auto"
      className="calorie-form-card"
      role="dialog"
      aria-labelledby={dateHeadingId}
      onToggle={(event) => {
        if (event.newState === "closed") {
          setPopoverDismissed(true)
        }
      }}
    >
      <button className="icon ghost dismiss" aria-label="dismiss" onClick={dismiss}>
        <XIcon width="16px" />
      </button>
      <h2 id={dateHeadingId}>
        {date.day} {date.month}
      </h2>
      <form onSubmit={handleSubmit}>
        <FormControl
          hideLabel
          pattern="[0-9]{1,4}"
          label="In"
          defaultValue={`${consumed ?? ""}`}
          size={4}
        />
        <FormControl
          hideLabel
          pattern="[0-9]{1,4}"
          label="Out"
          defaultValue={`${expended ?? ""}`}
          size={4}
        />
        <button className="icon ghost">
          <TickIcon width="20px" colour="var(--success-colour)" />
        </button>
      </form>
    </div>
  )
}
