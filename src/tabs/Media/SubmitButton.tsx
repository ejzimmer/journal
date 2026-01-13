import { TickIcon } from "../../shared/icons/Tick"

export function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="outline"
      style={{ width: "min-content", alignSelf: "end" }}
      aria-label={label}
    >
      <TickIcon colour="var(--success-colour)" width="20px" />
    </button>
  )
}
