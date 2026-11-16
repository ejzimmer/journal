import { DeleteWithConfirmation } from 'shared/controls/DeleteWithConfirmation';
import { TickIcon } from 'shared/icons/Tick';
import { XIcon } from 'shared/icons/X';

type EditFormActionsProps = {
  onCancel: () => void;
  onDelete: () => void;
};

export function EditFormActions({ onCancel, onDelete }: EditFormActionsProps) {
  return (
    <div className="edit-actions">
      <DeleteWithConfirmation
        className="card-control"
        label="Delete project"
        confirmLabel="Confirm delete project"
        onDelete={onDelete}
      />
      <button
        type="button"
        className="form-action"
        aria-label="Cancel changes"
        title="Cancel changes"
        onClick={onCancel}
      >
        <XIcon width="14" />
      </button>
      <button
        type="submit"
        className="form-action primary"
        aria-label="Save changes"
        title="Save changes"
      >
        <TickIcon width="18" strokeWidth="3" />
      </button>
    </div>
  );
}
