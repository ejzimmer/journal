import { Button, Checkbox, Input } from "@chakra-ui/react"
import { useState, useRef, FormEvent, useEffect } from "react"

type Props = {
  title: string
  isDone: boolean
  onDoneChange: (done: boolean) => void
  onTitleChange: (title: string) => void
  onDelete: () => void
}

export function SubTask({
  title,
  isDone,
  onDoneChange,
  onTitleChange,
  onDelete,
}: Props) {
  const [inEditMode, setInEditMode] = useState(false)
  const editTitleRef = useRef<HTMLInputElement>(null)
  const editTitleFormRef = useRef<HTMLFormElement>(null)

  const switchToEditMode = () => setInEditMode(true)
  const handleSubmit = (event: FormEvent) => {
    console.log("in onSUbmite")
    event.preventDefault()
    const newTitle = editTitleRef.current?.value
    if (newTitle) {
      onTitleChange(newTitle)
      setInEditMode(false)
    }
  }

  useEffect(() => {
    const clickOutsideListener = (event: MouseEvent) => {
      if (!editTitleFormRef.current?.contains(event.target as Node)) {
        setInEditMode(false)
      }
    }

    if (inEditMode) {
      window.addEventListener("click", clickOutsideListener)
    }

    return () => {
      if (!inEditMode) {
        window.removeEventListener("click", clickOutsideListener)
      }
    }
  }, [inEditMode])

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1em",
        flexGrow: "1",
        paddingLeft: "1em",
        cursor: "pointer",
      }}
    >
      <Checkbox
        borderColor="gray.500"
        isChecked={isDone}
        onChange={(event) => onDoneChange(event.target.checked)}
      />
      {inEditMode ? (
        <form ref={editTitleFormRef} onSubmit={handleSubmit}>
          <Input ref={editTitleRef} defaultValue={title} />
          <Button aria-label="Save task" type="submit">
            ✅
          </Button>
        </form>
      ) : (
        title
      )}
      <Button aria-label={`Edit task: ${title}`} onClick={switchToEditMode}>
        ✏️
      </Button>
      <Button aria-label={`Delete task: ${title}`} onClick={onDelete}>
        🗑️
      </Button>
    </label>
  )
}
