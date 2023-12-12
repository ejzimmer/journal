import { Input, chakra } from "@chakra-ui/react"
import { FormEvent, useEffect, useRef, useState } from "react"
import { ColouredButton } from "./style"

type Props = {
  onSubmit: (description: string) => void
}

export function NewTaskForm({ onSubmit }: Props) {
  const [isShowingForm, setShowingForm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const description = inputRef.current?.value ?? ""

    description && onSubmit(description)
    formRef.current?.reset()
  }

  const showForm = (event: React.MouseEvent) => {
    event.stopPropagation()
    setShowingForm(true)
  }

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !formRef.current?.contains(event.target)
      ) {
        setShowingForm(false)
      }
    }

    window.addEventListener("click", handleClick)

    return () => window.removeEventListener("click", handleClick)
  }, [])

  return isShowingForm ? (
    <chakra.form
      onSubmit={handleSubmit}
      ref={formRef}
      display="flex"
      padding=".25em"
      gap=".25em"
      aria-label="New task"
    >
      <Input
        ref={inputRef}
        aria-label="New task description"
        {...inputStyleProps}
      />
      <AddButton />
      <CancelButton onClick={() => setShowingForm(false)} />
    </chakra.form>
  ) : (
    <ColouredButton onClick={showForm} {...newTaskButtonStyles}>
      ➕ New task
    </ColouredButton>
  )
}

function AddButton() {
  return (
    <ColouredButton type="submit" aria-label="Add" paddingX="0">
      <svg viewBox="0 0 100 100" height="100%">
        <path
          d="M10,60 L38 85, 85 20"
          stroke="hsl(180 50% 40%)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </ColouredButton>
  )
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <ColouredButton aria-label="Cancel" onClick={onClick} paddingX="0">
      <svg
        viewBox="0 0 100 100"
        height="100%"
        stroke="hsl(0 50% 50%)"
        strokeWidth="10"
        strokeLinecap="round"
      >
        <path d="M20,20 L80 80" />
        <path d="M20, 80 L80 20" />
      </svg>
    </ColouredButton>
  )
}

const inputStyleProps = {
  backgroundColor: "hsl(0 0% 100% / 0.5)",
  height: "var(--input-height)",
  borderColor: "transparent",
  borderWidth: "2px",
  _hover: {
    borderColor:
      "color-mix(in hsl shorter hue, var(--colour), hsl(300 0% 25%))",
  },
  _focus: {
    borderColor:
      "color-mix(in hsl shorter hue, var(--colour), hsl(300 0% 25%))",
    outline: "none",
    boxShadow: "none",
  },
  color: "rgb(26, 32, 44)",
  paddingTop: ".25em",
}

const newTaskButtonStyles = {
  marginX: ".5em",
  marginY: ".4em",
  paddingLeft: ".5em",
  paddingTop: ".25em",
}
