import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { EmojiCheckbox } from "./EmojiCheckbox"
import { CategoriesContext } from "../../tabs/Todo"
import { Combobox } from "./combobox/Combobox"

import "./EditableDescription.css"

type Change =
  | { isChecked: boolean }
  | { category: string }
  | { description: string }

export type EditableDescriptionProps = {
  category: string
  description: string
  isChecked: boolean
  onChange: (change: Change) => void
}

export function EditableDescription({
  category,
  description,
  isChecked,
  onChange,
}: EditableDescriptionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inEditMode, setInEditMode] = useState(false)
  const [inputValue, setInputValue] = useState(description)

  const startEditing = () => setInEditMode(true)
  const stopEditing = () => setInEditMode(false)

  const categories = useContext(CategoriesContext)
  if (!categories) {
    throw new Error("Missing categories context provider")
  }
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category, label: category })),
    [categories],
  )

  useEffect(() => {
    if (inputRef.current && inEditMode) {
      inputRef.current.focus()
    }
  }, [inEditMode])

  if (inEditMode) {
    return (
      <div
        className="editable-description"
        onKeyDown={({ key }) => {
          if (key === "Enter" && inputValue !== description) {
            onChange({ description: inputValue })
          }

          if (["Enter", "Escape"].includes(key)) {
            stopEditing()
          }
        }}
      >
        <Combobox
          value={{ id: category, label: category }}
          options={categoryOptions}
          createOption={(value) => ({ id: value, label: value })}
          onChange={(value) => {
            onChange({ category: value.id })
            stopEditing()
          }}
          inputSize={1}
          ariaLabel="Category"
        />
        <input
          className="subtle"
          ref={inputRef}
          aria-label="Description"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          size={inputValue.length}
        />
      </div>
    )
  }

  return (
    <div className="editable-description">
      <EmojiCheckbox
        emoji={category}
        isChecked={isChecked}
        label={`${description} done`}
        onChange={() => onChange({ isChecked: !isChecked })}
      />
      <div tabIndex={0} onFocus={startEditing} onClick={startEditing}>
        {description}
      </div>
    </div>
  )
}
