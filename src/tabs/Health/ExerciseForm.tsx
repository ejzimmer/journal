import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { getToday } from '../../shared/dates';
import { ExerciseUpdate, Recommendation } from '../../shared/types';

const RECOMMENDATION_OPTIONS: { label: string; value?: Recommendation }[] = [
  { label: 'increase', value: 'increase' },
  { label: 'no change' },
  { label: 'decrease', value: 'decrease' },
];

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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(getToday());
  const [details, setDetails] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation>();
  const recommendationName = useId();

  useEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || !details.trim()) {
      return;
    }

    onSubmit({
      date,
      details: details.trim(),
      ...(recommendation && { recommendation }),
    });
  };

  return (
    <form
      className="exercise-form"
      aria-label={`Record ${exerciseName}`}
      onSubmit={handleSubmit}
      onKeyDown={(event) => event.key === 'Escape' && onCancel()}
    >
      <label>
        Date
        <input
          ref={dateInputRef}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </label>
      <label>
        Details
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          required
        />
      </label>
      <fieldset>
        <legend>Recommendation</legend>
        {RECOMMENDATION_OPTIONS.map(({ label, value }) => (
          <label key={label}>
            <input
              type="radio"
              name={recommendationName}
              checked={recommendation === value}
              onChange={() => setRecommendation(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="actions">
        <button type="button" className="outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary">
          Save
        </button>
      </div>
    </form>
  );
}
