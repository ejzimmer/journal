import "./EmojiRadio.css"

type EmojiRadioProps = {
  emoji: string | React.ReactElement
  isChecked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  name: string
  value: string
}

export function EmojiRadio({
  emoji,
  isChecked,
  onChange,
  label,
  name,
  value,
}: EmojiRadioProps) {
  return (
    <label className={`emoji-radio ${isChecked ? "checked" : ""}`}>
      <input
        aria-label={label}
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={onChange}
      />
      {typeof emoji === "string" ? <div>{emoji}</div> : emoji}
    </label>
  )
}
