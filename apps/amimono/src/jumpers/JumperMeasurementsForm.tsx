import { EasedMeasurementFields } from './EasedMeasurementFields';
import { JumperGaugeFields } from './JumperGaugeFields';
import {
  CAP_TOP_GUIDE,
  EASED_MEASUREMENTS,
  FIXED_MEASUREMENTS,
  JumperDraft,
} from './jumperDraft';
import { NumberField } from './NumberField';
import { EasedMeasurementKey, FixedMeasurementKey } from './types';

type JumperMeasurementsFormProps = {
  draft: JumperDraft;
  onChange: (draft: JumperDraft) => void;
};

export function JumperMeasurementsForm({
  draft,
  onChange,
}: JumperMeasurementsFormProps) {
  return (
    <div className="jumper-measurements">
      <fieldset className="fixed-measurements">
        <legend className="visually-hidden">Measurements</legend>
        {(
          Object.entries(FIXED_MEASUREMENTS) as [FixedMeasurementKey, string][]
        ).map(([key, label]) => (
          <NumberField
            key={key}
            label={label}
            unit="cm"
            value={draft[key]}
            onChange={(cm) => onChange({ ...draft, [key]: cm })}
          />
        ))}
      </fieldset>
      {(
        Object.entries(EASED_MEASUREMENTS) as [
          EasedMeasurementKey,
          (typeof EASED_MEASUREMENTS)[EasedMeasurementKey],
        ][]
      ).map(([key, { label, easeGuide }]) => (
        <EasedMeasurementFields
          key={key}
          label={label}
          easeGuide={easeGuide}
          measurement={draft[key]}
          onChange={(measurement) => onChange({ ...draft, [key]: measurement })}
        />
      ))}
      <JumperGaugeFields
        legend="Body gauge per 10cm"
        gauge={draft.gauge}
        onChange={(gauge) => onChange({ ...draft, gauge })}
      />
      <JumperGaugeFields
        legend="Sleeve gauge per 10cm"
        gauge={draft.sleeveGauge}
        onChange={(sleeveGauge) => onChange({ ...draft, sleeveGauge })}
      />
      <NumberField
        label="Sleeve cap top"
        unit="% of biceps"
        value={draft.capTopPercent}
        onChange={(capTopPercent) => onChange({ ...draft, capTopPercent })}
        hint={CAP_TOP_GUIDE}
      />
    </div>
  );
}
