import { useId } from 'react';
import { Switch } from 'shared/controls/Switch';
import { EasedMeasurementDraft } from './jumperDraft';
import { MeasurementSource } from './types';
import { NumberField } from './NumberField';

const SOURCES: MeasurementSource[] = ['body', 'garment'];
const SOURCE_LABELS: Record<MeasurementSource, string> = {
  body: 'Body',
  garment: 'Garment',
};

type EasedMeasurementFieldsProps = {
  label: string;
  easeGuide?: string;
  measurement: EasedMeasurementDraft;
  onChange: (measurement: EasedMeasurementDraft) => void;
};

export function EasedMeasurementFields({
  label,
  easeGuide,
  measurement,
  onChange,
}: EasedMeasurementFieldsProps) {
  const sourceName = useId();

  return (
    <fieldset className="eased-measurement">
      <legend className="visually-hidden">{label}</legend>
      <NumberField
        label={label}
        unit="cm"
        value={measurement.cm}
        onChange={(cm) => onChange({ ...measurement, cm })}
      />
      <Switch
        options={SOURCES}
        value={measurement.source}
        onChange={(source) => onChange({ ...measurement, source })}
        name={sourceName}
        Option={SourceOptionLabel}
        className="source-switch"
      />
      {measurement.source === 'body' && (
        <NumberField
          label="Ease"
          unit="cm"
          value={measurement.easeCm}
          onChange={(easeCm) => onChange({ ...measurement, easeCm })}
          allowNegative
          hint={easeGuide}
        />
      )}
    </fieldset>
  );
}

function SourceOptionLabel({ value }: { value: MeasurementSource }) {
  return <span className="source-option">{SOURCE_LABELS[value]}</span>;
}
