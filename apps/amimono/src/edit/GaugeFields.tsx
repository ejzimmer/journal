import { useId } from 'react';

import { ProjectDraft } from './projectDraft';

type GaugeFieldsProps = {
  draft: ProjectDraft;
  onChange: (changes: Partial<ProjectDraft>) => void;
};

export function GaugeFields({ draft, onChange }: GaugeFieldsProps) {
  const id = useId();

  return (
    <fieldset className="edit-field">
      <legend className="field-label">Gauge</legend>
      <div className="gauge-fields">
        <input
          id={`${id}-stitches`}
          type="number"
          min="0"
          value={draft.stitches}
          onChange={(event) => onChange({ stitches: event.target.value })}
        />
        <label htmlFor={`${id}-stitches`}>sts</label>
        <span aria-hidden="true">×</span>
        <input
          id={`${id}-rows`}
          type="number"
          min="0"
          value={draft.rows}
          onChange={(event) => onChange({ rows: event.target.value })}
        />
        <label htmlFor={`${id}-rows`}>rows</label>
        <span>on</span>
        <input
          id={`${id}-needle`}
          type="number"
          min="0"
          step="0.25"
          value={draft.needleMm}
          onChange={(event) => onChange({ needleMm: event.target.value })}
        />
        <label htmlFor={`${id}-needle`}>
          <span className="visually-hidden">Needle size in </span>mm
        </label>
      </div>
    </fieldset>
  );
}
