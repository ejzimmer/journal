import { ReactNode, useState } from "react"
import { Combobox } from "../../shared/controls/Combobox"
import { Category } from "./types"

type CategoryControlProps = {
  value?: Category
  onChange: (value?: Category) => void
  options: Category[]
}

export function CategoryControl({
  value,
  options,
  onChange,
}: CategoryControlProps) {
  const [partialCategory, setPartialCategory] = useState<string>("")

  const handleChangeText = (option: Category) => {
    if (option.emoji) {
      onChange(option)
      setPartialCategory("")
    } else {
      onChange(undefined)
      setPartialCategory(option.text)
    }
  }

  const handleChangeEmoji = (event: React.ChangeEvent<HTMLInputElement>) => {
    const emoji = event.target.value
    if (partialCategory && emoji) {
      onChange({ text: partialCategory, emoji })
      setPartialCategory("")
    }
  }

  return (
    <>
      <Combobox
        createOption={(text) => ({ text, emoji: "" })}
        label="Category"
        onChange={handleChangeText}
        options={options}
        value={partialCategory ? { text: partialCategory, emoji: "" } : value}
        Option={CategoryOption}
      />
      {!value && <input aria-label="Emoji" onChange={handleChangeEmoji} />}
    </>
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
