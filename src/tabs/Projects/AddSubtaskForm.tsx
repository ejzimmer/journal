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
      style={{
        minWidth: isFormVisible ? formWidthRef.current : 0,
        maxWidth: isFormVisible && description.length ? "max-content" : 0,
      }}
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
        size={description.length * 0.7}
      />
      <button className="ghost" disabled={!isFormVisible}>
        <TickIcon width="16px" colour="var(--action-colour)" />
      </button>
    </form>
  )
}
