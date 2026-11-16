import { useId } from 'react';

import { GaugeDraft } from './projectDraft';

type GaugeFieldsProps = {
  gauge: GaugeDraft;
  onChange: (gauge: GaugeDraft) => void;
};

export function GaugeFields({ gauge, onChange }: GaugeFieldsProps) {
  const id = useId();

  return (
    <fieldset className="edit-field">
      <legend className="field-label">Gauge</legend>
      <div className="gauge-fields">
        <input
          id={`${id}-stitches`}
          type="number"
          min="0"
          value={gauge.stitches}
          onChange={(event) =>
            onChange({ ...gauge, stitches: event.target.value })
          }
        />
        <label htmlFor={`${id}-stitches`}>sts</label>
        <span aria-hidden="true">×</span>
        <input
          id={`${id}-rows`}
          type="number"
          min="0"
          value={gauge.rows}
          onChange={(event) => onChange({ ...gauge, rows: event.target.value })}
        />
        <label htmlFor={`${id}-rows`}>rows</label>
        <span>on</span>
        <input
          id={`${id}-needle`}
          type="number"
          min="0"
          step="0.25"
          value={gauge.needleMm}
          onChange={(event) =>
            onChange({ ...gauge, needleMm: event.target.value })
          }
        />
        <label htmlFor={`${id}-needle`}>
          <span className="visually-hidden">Needle size in </span>mm
        </label>
      </div>
    </fieldset>
  );
}
