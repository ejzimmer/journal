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
      <legend className="field-label">Gauge per 10 cm</legend>
      <div className="gauge-fields">
        <label htmlFor={`${id}-stitches`}>Stitches</label>
        <label htmlFor={`${id}-rows`}>Rows</label>
        <label htmlFor={`${id}-needle`}>Needle (mm)</label>
        <input
          id={`${id}-stitches`}
          type="number"
          min="0"
          value={draft.stitches}
          onChange={(event) => onChange({ stitches: event.target.value })}
        />
        <input
          id={`${id}-rows`}
          type="number"
          min="0"
          value={draft.rows}
          onChange={(event) => onChange({ rows: event.target.value })}
        />
        <input
          id={`${id}-needle`}
          type="number"
          min="0"
          step="0.25"
          value={draft.needleMm}
          onChange={(event) => onChange({ needleMm: event.target.value })}
        />
      </div>
    </fieldset>
  );
}
