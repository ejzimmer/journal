import { useId } from 'react';

import { ProjectDraft } from './projectDraft';

type GaugeFieldsProps = {
  draft: ProjectDraft;
  onChange: (changes: Partial<ProjectDraft>) => void;
};

export function GaugeFields({ draft, onChange }: GaugeFieldsProps) {
  const labelId = useId();

  return (
    <div className="edit-field" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="field-label">
        Gauge
      </span>
      <div className="gauge-fields">
        <input
          aria-label="Stitches per 10 cm"
          type="number"
          min="0"
          value={draft.stitches}
          onChange={(event) => onChange({ stitches: event.target.value })}
        />
        <span>sts ×</span>
        <input
          aria-label="Rows per 10 cm"
          type="number"
          min="0"
          value={draft.rows}
          onChange={(event) => onChange({ rows: event.target.value })}
        />
        <span>rows on</span>
        <input
          aria-label="Needle size in mm"
          type="number"
          min="0"
          step="0.25"
          value={draft.needleMm}
          onChange={(event) => onChange({ needleMm: event.target.value })}
        />
        <span>mm</span>
      </div>
    </div>
  );
}
