import { TagIcon } from '../../../shared/icons/Tag';
import { useFormToggle } from '../../../shared/controls/useFormToggle';
import { LabelsControl } from '../LabelsControl';
import { Label } from '../types';

export function UpdateLabels({
  labels = [],
  onChangeLabels,
}: {
  labels?: Label[];
  onChangeLabels: (labels: Label[]) => void;
}) {
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();

  return isFormOpen ? (
    <LabelsControl
      value={labels}
      onChange={(labels) => {
        onChangeLabels(labels);
        closeForm();
      }}
      label=""
      ariaLabel="Labels"
      autoFocus
      onDismiss={closeForm}
    />
  ) : (
    <button
      ref={triggerRef}
      type="button"
      className="add-metadata ghost"
      aria-label="Add label"
      onClick={openForm}
    >
      <TagIcon width="28px" />
    </button>
  );
}
