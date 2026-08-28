import { FormEvent, useEffect, useId, useRef } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { TickIcon } from "../../../shared/icons/Tick"
import { XIcon } from "../../../shared/icons/X"

type CalorieFormProps = {
  date: { day: number; month: string }
  consumed?: number
  expended?: number
  onClose: () => void
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
  onClose,
  onSubmit,
}: CalorieFormProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const dateHeadingId = useId()

  useEffect(() => {
    popoverRef.current?.showPopover()
  }, [])

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
    onClose()
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
          onClose()
        }
      }}
    >
      <button className="icon ghost dismiss" aria-label="dismiss" onClick={onClose}>
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
        <button type="submit" className="icon ghost">
          <TickIcon width="20px" colour="var(--success-colour)" />
        </button>
      </form>
    </div>
  )
}
