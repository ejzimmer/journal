import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import { XIcon } from "../../shared/icons/X"

type DeleteTaskButtonProps = {
  description: string
  onDelete: () => void
}

export function DeleteTaskButton({
  description,
  onDelete,
}: DeleteTaskButtonProps) {
  return (
    <ConfirmationModal
      trigger={(props) => (
        <button
          {...props}
          aria-label={`delete ${description}`}
          className="ghost"
        >
          <XIcon width="16px" colour="var(--body-colour)" />
        </button>
      )}
      message={`Are you sure you want to delete ${description}?`}
      onConfirm={onDelete}
      confirmButtonText="Yes, delete"
    />
  )
}
