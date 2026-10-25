import { FormEvent, useId, useState } from 'react';
import { getToday } from '../../shared/dates';
import { ExerciseUpdate } from '../../shared/types';
import { Switch } from '../../shared/controls/Switch';
import { XIcon } from '../../shared/icons/X';
import { TickIcon } from '../../shared/icons/Tick';
import { DeleteWithConfirmation } from '../../shared/controls/DeleteWithConfirmation';
import {
  RecommendationOption,
  RecommendationOptionIcon,
} from './RecommendationOptionIcon';

const RECOMMENDATION_OPTIONS: RecommendationOption[] = [
  'increase',
  'no change',
  'decrease',
];

type ExerciseFormProps = {
  exerciseName: string;
  update?: ExerciseUpdate;
  defaultDetails?: string;
  onSubmit: (update: Omit<ExerciseUpdate, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export function ExerciseForm({
  exerciseName,
  update,
  defaultDetails = '',
  onSubmit,
  onCancel,
  onDelete,
}: ExerciseFormProps) {
  const [date, setDate] = useState(update?.date ?? getToday());
  const [details, setDetails] = useState(update?.details ?? defaultDetails);
  const [recommendation, setRecommendation] = useState<RecommendationOption>(
    update?.recommendation ?? 'no change',
  );
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
      aria-label={`${update ? 'Edit' : 'Record'} ${exerciseName}`}
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
            Option={RecommendationOptionIcon}
          />
        </fieldset>
      </div>
      <div className="actions">
        {onDelete && <DeleteWithConfirmation onDelete={onDelete} />}
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
