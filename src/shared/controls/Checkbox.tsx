import { DoneTick } from "./DoneTick"
import "./Checkbox.css"

type CheckboxProps = {
  isChecked: boolean
  onChange: (isChecked: boolean) => void
  useTickForDone?: boolean
  "aria-label": string
}

export function Checkbox(props: CheckboxProps) {
  const { isChecked, onChange, useTickForDone } = props

  return (
    <label className={`checkbox ${useTickForDone ? "tick-for-done" : ""}`}>
      {isChecked && useTickForDone ? (
        <DoneTick />
      ) : (
        <div className="control">
          <svg
            viewBox="0 0 10 10"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M2,6 L4,8 8,2" />
          </svg>
        </div>
      )}
      <input
        type="checkbox"
        aria-label={props["aria-label"]}
        checked={isChecked}
        onChange={(event) => {
          onChange(event.target.checked)
        }}
      />
    </label>
  )
}
