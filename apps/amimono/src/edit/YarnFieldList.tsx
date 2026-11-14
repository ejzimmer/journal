import { useId } from 'react';

import { PlusIcon } from 'shared/icons/Plus';
import { createYarnDraft, YarnDraft } from './projectDraft';
import { YarnFields } from './YarnFields';

type YarnFieldListProps = {
  yarns: YarnDraft[];
  onChange: (yarns: YarnDraft[]) => void;
};

export function YarnFieldList({ yarns, onChange }: YarnFieldListProps) {
  const labelId = useId();

  const updateYarn = (updatedYarn: YarnDraft) =>
    onChange(
      yarns.map((yarn) => (yarn.id === updatedYarn.id ? updatedYarn : yarn)),
    );

  return (
    <div
      className="edit-field yarn-field-list"
      role="group"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="field-label">
        Yarn
      </span>
      {yarns.map((yarn) => (
        <YarnFields key={yarn.id} yarn={yarn} onChange={updateYarn} />
      ))}
      <button
        type="button"
        className="add-button"
        aria-label="Add yarn"
        title="Add yarn"
        onClick={() => onChange([...yarns, createYarnDraft()])}
      >
        <PlusIcon width="20" />
      </button>
    </div>
  );
}
