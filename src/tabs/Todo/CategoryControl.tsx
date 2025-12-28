import { ReactNode, useState } from "react"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { Category } from "./types"

import "./CategoryControl.css"
import { TickIcon } from "../../shared/icons/Tick"
import { XIcon } from "../../shared/icons/X"

export type CategoryControlProps = {
  value?: Category
  onChange: (value?: Category) => void
  options: Category[]
}

export function CategoryControl({
  value,
  options,
  onChange,
}: CategoryControlProps) {
  const [text, setText] = useState<string>("")
  const [emoji, setEmoji] = useState<string>("")

  const handleChangeText = (option: Category) => {
    if (option.emoji) {
      onChange(option)
      setText("")
    } else {
      onChange(undefined)
      setText(option.text)
      setEmoji("")
    }
  }

  const handleSubmit = () => {
    onChange({ text, emoji })
  }

  return (
    <div className="category-control">
      {!text ? (
        <Combobox
          createOption={(text) => ({ text, emoji: "" })}
          label="Category"
          onChange={handleChangeText}
          options={options}
          value={value}
          Option={CategoryOption}
        />
      ) : (
        <>
          <input
            aria-label="Text"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <input
            aria-label="Emoji"
            value={emoji}
            size={1}
            onChange={(event) => setEmoji(event.target.value)}
          />
          <button
            aria-label="Create"
            className="icon outline"
            onClick={handleSubmit}
          >
            <TickIcon width="16px" colour="var(--success-colour)" />
          </button>
          <button aria-label="Cancel" className="icon outline">
            <XIcon width="16px" colour="var(--error-colour)" />
          </button>
        </>
      )}
    </div>
  )
}

function CategoryOption({
  option,
  children,
}: {
  option: Category
  children?: ReactNode
}) {
  return (
    <>
      {option.emoji} {option.text}
      {children}
    </>
  )
}
