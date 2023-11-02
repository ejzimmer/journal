import { Button, Input, chakra } from "@chakra-ui/react"
import styled from "@emotion/styled"
import { FormEvent, useEffect, useRef } from "react"
import { ColouredButton } from "./style"

type Props = {
  onSubmit: (name: string) => void
  onCancel: () => void
  colour?: string
}

export function NewTaskForm({ onSubmit, onCancel, colour }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const name = inputRef.current?.value ?? ""
    onSubmit(name)
  }

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !formRef.current?.contains(event.target)
      ) {
        onCancel()
      }
    }

    window.addEventListener("click", handleClick)

    return () => window.removeEventListener("click", handleClick)
  }, [onCancel])

  return (
    <chakra.form
      onSubmit={handleSubmit}
      ref={formRef}
      display="flex"
      padding=".25em"
      gap=".25em"
      color={colour}
    >
      <Input
        ref={inputRef}
        aria-label="New task description"
        backgroundColor="hsl(0 0% 100% / 0.5)"
        height="var(--input-height)"
        borderColor="transparent"
        borderWidth="2px"
        _hover={{
          borderColor: `color-mix(
          in hsl shorter hue,
          ${colour},
          hsl(300 0% 25%)
        )`,
        }}
        _focus={{
          borderColor: `color-mix(
          in hsl shorter hue,
          ${colour},
          hsl(300 0% 25%)
        )`,
          outline: "none",
          boxShadow: "none",
        }}
        color="rgb(26, 32, 44)"
        paddingTop=".25em"
      />
      <ColouredButton
        colour={colour}
        type="submit"
        aria-label="Add"
        paddingX="0"
      >
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
      <ColouredButton
        colour={colour}
        aria-label="Cancel"
        onClick={onCancel}
        paddingX="0"
      >
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
    </chakra.form>
  )
}
