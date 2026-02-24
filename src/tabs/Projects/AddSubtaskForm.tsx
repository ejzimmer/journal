import { useRef, useState, useEffect } from "react"
import { TickIcon } from "../../shared/icons/Tick"

type AddSubtaskFormProps = {
  isFormVisible: boolean
  onAddSubtask: (description: string) => void
}

export function AddSubtaskForm({
  isFormVisible,
  onAddSubtask,
}: AddSubtaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const formWidthRef = useRef(0)
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (formRef.current) {
      formWidthRef.current = formRef.current.scrollWidth + 30
    }
  }, [])

  return (
    <form
      ref={formRef}
      className={`add-subtask-form ${isFormVisible ? "visible" : ""}`}
      style={{ width: isFormVisible ? formWidthRef.current : 0 }}
      onSubmit={(event) => {
        event.preventDefault()

        onAddSubtask(description)
        setDescription("")
      }}
    >
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={!isFormVisible}
      />
      <button className="ghost" disabled={!isFormVisible}>
        <TickIcon width="16px" colour="var(--action-colour)" />
      </button>
    </form>
  )
}
