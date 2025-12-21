import { ReactNode, useState } from "react"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { Category } from "./types"

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
    }
  }

  const handleSubmit = () => {
    onChange({ text, emoji })
  }

  return (
    <div>
      {value && value.emoji ? (
        <Combobox
          createOption={(text) => ({ text, emoji: "" })}
          label="Category"
          onChange={handleChangeText}
          options={options}
          value={value}
          Option={CategoryOption}
        />
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            aria-label="Text"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <input
            aria-label="Emoji"
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
          />
          <button onClick={handleSubmit}>Create</button>
          <button>Cancel</button>
        </div>
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
