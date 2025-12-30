import { TickIcon } from "../../shared/icons/Tick"

export function SubmitButton() {
  return (
    <button
      type="submit"
      className="outline"
      style={{ width: "min-content", alignSelf: "end" }}
    >
      <TickIcon colour="var(--success-colour)" width="20px" />
    </button>
  )
}
