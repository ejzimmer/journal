import { useContext, FormEvent } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { TickIcon } from "../../../shared/icons/Tick"

type CalorieFormProps = {
  consumed?: number
  expended?: number
  onSubmit: ({
    consumed,
    expended,
  }: {
    consumed: number
    expended: number
  }) => void
}
export function CalorieForm({
  consumed,
  expended,
  onSubmit,
}: CalorieFormProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("no storage context")
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
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl
        hideLabel
        pattern="[0-9]{1,4}"
        label="consumed"
        defaultValue={`${consumed ?? ""}`}
        size={4}
      />
      <FormControl
        hideLabel
        pattern="[0-9]{1,4}"
        label="expended"
        defaultValue={`${expended ?? ""}`}
        size={4}
      />
      <button className="icon ghost">
        <TickIcon width="20px" colour="var(--success-colour)" />
      </button>
    </form>
  )
}
