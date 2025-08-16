import { useEffect, useRef, useState } from "react"
import { COLOURS } from "../../shared/TodoList/types"

type AddTaskFormProps = {
  onSubmit: ({
    description,
    type,
  }: {
    description: string
    type: keyof typeof COLOURS
  }) => void
}

export function AddTaskForm({ onSubmit }: AddTaskFormProps) {
  const [formIsVisible, setFormIsVisible] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const description = descriptionRef.current?.value
    const type = typeRef.current?.value as keyof typeof COLOURS

    if (description && type) {
      onSubmit({ description, type })
      ;(event.target as HTMLFormElement).reset()
    }
  }

  useEffect(() => {
    if (!formIsVisible || !formRef.current) {
      return
    }

    const onInteraction = () => {
      if (!formRef.current?.contains(document.activeElement)) {
        setFormIsVisible(false)
      }
    }

    window.addEventListener("click", onInteraction)
    window.addEventListener("keydown", onInteraction)

    return () => {
      window.removeEventListener("click", onInteraction)
      window.removeEventListener("keydown", onInteraction)
    }
  })

  return (
    <form ref={formRef} action="#" method="" onSubmit={handleSubmit}>
      <button
        type="button"
        aria-expanded={formIsVisible}
        onClick={() => setFormIsVisible(!formIsVisible)}
      >
        {formIsVisible ? "hide add task form" : "show add task form"}
      </button>
      {formIsVisible && (
        <>
          <select ref={typeRef} aria-label="task type">
            {Object.keys(COLOURS).map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
          </select>
          <input ref={descriptionRef} aria-label="task description" />
          <input type="submit" />
        </>
      )}
    </form>
  )
}
