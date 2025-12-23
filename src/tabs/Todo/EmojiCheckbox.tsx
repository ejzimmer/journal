import "./EmojiCheckbox.css"

type EmojiCheckboxProps = {
  emoji: string
  isChecked: boolean
  onChange: () => void
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
      <div>{emoji}</div>
    </label>
  )
}
