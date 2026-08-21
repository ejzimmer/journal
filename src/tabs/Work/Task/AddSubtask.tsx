import {
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react"
import { PlusIcon } from "../../../shared/icons/Plus"
import { useWorkStorage } from "../WorkStorageContext"
import { StandardChecklistButton } from "./StandardChecklistButton"

type AddSubtaskProps = {
  listId: string
  taskId: string
}

export function AddSubtask({ listId, taskId }: AddSubtaskProps) {
  const [formIsVisible, setFormVisible] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addSubtask } = useWorkStorage()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value.trim()
    if (description) {
      addSubtask(listId, taskId, description)
    }
    setFormVisible(false)
  }

  const handleBlur = (event: FocusEvent) => {
    const nextFocused = event.relatedTarget as Node | null
    const movedOutsideForm = !formRef.current?.contains(nextFocused)
    if (movedOutsideForm && !inputRef.current?.value) {
      setFormVisible(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setFormVisible(false)
    }
  }

  if (!formIsVisible) {
    return (
      <button
        type="button"
        className="add-metadata ghost"
        aria-label="Add subtask"
        onClick={() => setFormVisible(true)}
      >
        <PlusIcon width="16px" />
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className="add-subtask"
    >
      <input
        ref={inputRef}
        autoFocus
        aria-label="New subtask"
        className="inline"
        onKeyDown={handleKeyDown}
      />
      <StandardChecklistButton
        listId={listId}
        taskId={taskId}
        onAdd={() => inputRef.current?.focus()}
      />
    </form>
  )
}
