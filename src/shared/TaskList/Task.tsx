import { Button, Input } from "@chakra-ui/react"
import { Checkbox } from "../controls/Checkbox"
import { useItem } from "../storage/Context"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { TaskButton } from "./TaskButton"
import { FormEvent, useEffect, useRef, useState } from "react"
import { ItemDescription } from "./ItemDescription"

export function Task({ id }: { id: string }) {
  const [isAddingNewTask, setAddingNewTask] = useState(false)
  const { item, error, isLoading, onChange, onDelete, onAddSubtask } =
    useItem(id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !item) {
    return <div>{error?.message ?? "Could not find item"}</div>
  }

  return (
    <>
      <Checkbox
        label={`${item.description}`}
        isChecked={item.isComplete}
        onChange={() => {
          onChange({ ...item, isComplete: !item.isComplete })
        }}
      />
      <ItemDescription
        description={item.description}
        onChange={(description) => onChange({ ...item, description })}
        isDone={item.isComplete}
      />
      <TaskButton
        aria-label={`Add subtask to ${item.description}`}
        onClick={() => setAddingNewTask(true)}
      >
        +
      </TaskButton>
      <DeleteTaskButton
        taskDescription={item.description}
        onDelete={onDelete}
      />
      {isAddingNewTask && (
        <AddSubtaskForm
          onSubmit={onAddSubtask}
          onCancel={() => setAddingNewTask(false)}
        />
      )}
      {item.items?.length && (
        <ul>
          {item.items.map((item) => (
            <li key={item}>
              <Task id={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function AddSubtaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (description: string) => void
  onCancel: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const addSubtask = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value
    if (!inputRef.current ?? !description) return

    onSubmit(description)
    inputRef.current.value = ""
  }

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!inputRef.current) return

      if (
        event.target &&
        !inputRef.current.parentElement?.contains(event.target as HTMLElement)
      ) {
        onCancel()
      }
    }

    window.addEventListener("click", listener)

    return () => window.removeEventListener("click", listener)
  })

  return (
    <form onSubmit={addSubtask}>
      <Input ref={inputRef} aria-label="Subtask description" />
      <Button type="submit">Add</Button>
      <Button type="reset" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  )
}
