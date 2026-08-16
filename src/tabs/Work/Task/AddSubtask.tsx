import {
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  useContext,
  useRef,
  useState,
} from "react"
import { PlusIcon } from "../../../shared/icons/Plus"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Subtask } from "../types"
import { StandardChecklistButton } from "./StandardChecklistButton"

type AddSubtaskProps = {
  subtasks?: Record<string, Subtask>
  path: string
}

export function AddSubtask({ subtasks, path }: AddSubtaskProps) {
  const [formIsVisible, setFormVisible] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing firebase context")
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value.trim()
    if (description) {
      storageContext.addItem(path, { description })
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
        subtasks={subtasks}
        path={path}
        onAdd={() => inputRef.current?.focus()}
      />
    </form>
  )
}
