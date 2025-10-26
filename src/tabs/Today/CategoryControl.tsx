import { ReactNode, useState } from "react"
import { Combobox } from "../../shared/controls/Combobox"

export type Category = {
  text: string
  emoji: string
}

type CategoryControlProps = {
  onChange: (value?: Category) => void
  options: Category[]
}

export function CategoryControl({ options, onChange }: CategoryControlProps) {
  const [partialCategory, setPartialCategory] = useState<string>()

  const handleChangeText = (option: Category) => {
    if (option.emoji) {
      onChange(option)
      setPartialCategory(undefined)
    } else {
      onChange(undefined)
      setPartialCategory(option.text)
    }
  }

  const handleChangeEmoji = (event: React.ChangeEvent<HTMLInputElement>) => {
    const emoji = event.target.value
    console.log(emoji)
    if (partialCategory && emoji) {
      onChange({ text: partialCategory, emoji })
      setPartialCategory(undefined)
    }
  }

  return (
    <>
      <Combobox
        createOption={(text) => ({ text, emoji: "" })}
        label="Category"
        onChange={handleChangeText}
        options={options}
        value={{ text: "Chore", emoji: "🧹" }}
        Option={CategoryOption}
      />
      {partialCategory && (
        <input aria-label="Emoji" onChange={handleChangeEmoji} />
      )}
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
