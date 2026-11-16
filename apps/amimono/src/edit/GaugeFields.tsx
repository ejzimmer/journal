import { FormControl } from 'shared/controls/FormControl';

import { ProjectDraft } from './projectDraft';

type GaugeFieldsProps = {
  draft: ProjectDraft;
  onChange: (changes: Partial<ProjectDraft>) => void;
};

export function GaugeFields({ draft, onChange }: GaugeFieldsProps) {
  return (
    <fieldset className="edit-field">
      <legend className="field-label">Gauge per 10 cm</legend>
      <div className="gauge-fields">
        <FormControl
          label="Stitches"
          type="number"
          min="0"
          value={draft.stitches}
          onChange={(stitches) => onChange({ stitches })}
        />
        <FormControl
          label="Rows"
          type="number"
          min="0"
          value={draft.rows}
          onChange={(rows) => onChange({ rows })}
        />
        <FormControl
          label="Needle (mm)"
          type="number"
          min="0"
          step="0.25"
          value={draft.needleMm}
          onChange={(needleMm) => onChange({ needleMm })}
        />
      </div>
    </fieldset>
  );
}
