import { ChangeEvent } from "react"
import "./EmojiCheckbox.css"

type EmojiCheckboxProps = {
  emoji: string | React.ReactElement
  isChecked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  label: string
}

export function EmojiCheckbox({
  emoji,
  isChecked,
  onChange,
  label,
}: EmojiCheckboxProps) {
  return (
    <label className={`emoji-checkbox ${isChecked ? "done" : ""}`}>
      <input
        aria-label={label}
        type="checkbox"
        onChange={onChange}
        checked={isChecked}
      />
      {typeof emoji === "string" ? (
        emoji.startsWith(".") ? (
          <img
            src={emoji}
            alt=""
            style={{
              verticalAlign: "bottom",
              maxWidth: "24px",
              maxHeight: "24px",
            }}
          />
        ) : (
          <div>{emoji}</div>
        )
      ) : (
        emoji
      )}
    </label>
  )
}
