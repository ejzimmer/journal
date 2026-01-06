import { useContext, useMemo } from "react"
import { Combobox } from "../../shared/controls/new_combobox/Combobox"
import { Category } from "./types"
import { CategoriesContext } from "."

import "./CategoryControl.css"

export type CategoryControlProps = {
  value?: Category
  onChange: (value?: Category) => void
}

const categoryToOption = ({ text, emoji }: Category) => ({
  id: text + emoji,
  label: text,
  emoji: emoji,
})

export function CategoryControl({ value, onChange }: CategoryControlProps) {
  const categories = useContext(CategoriesContext)
  if (!categories) {
    throw new Error("missing category context")
  }

  const options = useMemo(() => categories.map(categoryToOption), [categories])

  return (
    <div className="category-control">
      <Combobox
        value={value && categoryToOption(value)}
        options={options}
        createOption={(label: string) => ({ id: label, label, emoji: "" })}
        onChange={(option) =>
          onChange({ text: option.label, emoji: option.emoji })
        }
        Option={CategoryOption}
      />
      <input
        value={value?.emoji}
        onChange={(event) => {
          if (value?.text)
            onChange({ text: value.text, emoji: event.target.value })
        }}
        size={1}
      />
    </div>
  )
}

function CategoryOption({
  value,
}: {
  value: { id: string; label: string; emoji: string }
}) {
  return (
    <>
      {value.emoji} {value.label}
    </>
  )
}
