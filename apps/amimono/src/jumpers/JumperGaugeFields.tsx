import { useId } from 'react';
import { GaugeDraft } from './jumperDraft';
import { NumberField } from './NumberField';

type JumperGaugeFieldsProps = {
  legend: string;
  gauge: GaugeDraft;
  onChange: (gauge: GaugeDraft) => void;
};

export function JumperGaugeFields({
  legend,
  gauge,
  onChange,
}: JumperGaugeFieldsProps) {
  const yarnId = useId();

  return (
    <fieldset className="jumper-gauge">
      <legend>{legend}</legend>
      <NumberField
        label="Stitches"
        value={gauge.stitches}
        onChange={(stitches) => onChange({ ...gauge, stitches })}
      />
      <NumberField
        label="Rows"
        value={gauge.rows}
        onChange={(rows) => onChange({ ...gauge, rows })}
      />
      <NumberField
        label="Needle"
        unit="mm"
        value={gauge.needleMm}
        onChange={(needleMm) => onChange({ ...gauge, needleMm })}
      />
      <div className="text-field">
        <label htmlFor={yarnId}>Yarn</label>
        <input
          id={yarnId}
          value={gauge.yarn}
          onChange={(event) => onChange({ ...gauge, yarn: event.target.value })}
        />
      </div>
    </fieldset>
  );
}
