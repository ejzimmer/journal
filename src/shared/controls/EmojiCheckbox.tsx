import { ChangeEvent } from "react"
import "./EmojiCheckbox.css"

type EmojiCheckboxProps = {
  emoji: string | React.ReactElement
  isChecked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  doneIcon?: React.ReactElement
}

export function EmojiCheckbox({
  emoji,
  isChecked,
  onChange,
  label,
  doneIcon,
}: EmojiCheckboxProps) {
  const checkedClass = isChecked ? (doneIcon ? "done-icon" : "done") : ""

  return (
    <label className={`emoji-checkbox ${checkedClass}`}>
      <input
        aria-label={label}
        type="checkbox"
        onChange={onChange}
        checked={isChecked}
      />
      {isChecked && doneIcon ? (
        doneIcon
      ) : typeof emoji === "string" ? (
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
