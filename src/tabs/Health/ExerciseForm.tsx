import { FormEvent, useId, useState } from 'react';
import { getToday } from '../../shared/dates';
import { ExerciseUpdate, Recommendation } from '../../shared/types';
import { Switch } from '../../shared/controls/Switch';
import { ChevronUpIcon } from '../../shared/icons/ChevronUp';
import { ChevronDownIcon } from '../../shared/icons/ChevronDown';
import { MinusIcon } from '../../shared/icons/Minus';
import { XIcon } from '../../shared/icons/X';
import { TickIcon } from '../../shared/icons/Tick';

type RecommendationOption = Recommendation | 'no change';

const RECOMMENDATION_OPTIONS: RecommendationOption[] = [
  'increase',
  'no change',
  'decrease',
];

function RecommendationIcon({ value }: { value: RecommendationOption }) {
  if (value === 'increase') {
    return <ChevronUpIcon role="img" aria-label={value} />;
  }
  if (value === 'decrease') {
    return <ChevronDownIcon role="img" aria-label={value} />;
  }
  return <MinusIcon role="img" aria-label={value} />;
}

type ExerciseFormProps = {
  exerciseName: string;
  onSubmit: (update: Omit<ExerciseUpdate, 'id'>) => void;
  onCancel: () => void;
};

export function ExerciseForm({
  exerciseName,
  onSubmit,
  onCancel,
}: ExerciseFormProps) {
  const [date, setDate] = useState(getToday());
  const [details, setDetails] = useState('');
  const [recommendation, setRecommendation] =
    useState<RecommendationOption>('no change');
  const recommendationName = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || !details.trim()) {
      return;
    }

    onSubmit({
      date,
      details: details.trim(),
      ...(recommendation !== 'no change' && { recommendation }),
    });
  };

  return (
    <form
      className="exercise-form"
      aria-label={`Record ${exerciseName}`}
      onSubmit={handleSubmit}
      onKeyDown={(event) => event.key === 'Escape' && onCancel()}
    >
      <textarea
        aria-label="Details"
        autoFocus
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        required
      />
      <div className="settings">
        <input
          type="date"
          aria-label="Date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <fieldset aria-label="Recommendation">
          <Switch
            options={RECOMMENDATION_OPTIONS}
            value={recommendation}
            onChange={setRecommendation}
            name={recommendationName}
            Option={RecommendationIcon}
          />
        </fieldset>
      </div>
      <div className="actions">
        <button type="button" className="cancel" onClick={onCancel}>
          <XIcon role="img" aria-label="Cancel" />
        </button>
        <button type="submit" className="save">
          <TickIcon role="img" aria-label="Save" />
        </button>
      </div>
    </form>
  );
}
