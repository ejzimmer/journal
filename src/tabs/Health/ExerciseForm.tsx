import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { getToday } from '../../shared/dates';
import {
  ExerciseUpdate,
  Recommendation,
  RECOMMENDATIONS,
} from '../../shared/types';

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
  const [recommendation, setRecommendation] =
    useState<Recommendation>('no change');
  const recommendationName = useId();

  useEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || !details.trim()) {
      return;
    }

    onSubmit({ date, details: details.trim(), recommendation });
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
        {RECOMMENDATIONS.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={recommendationName}
              value={option}
              checked={recommendation === option}
              onChange={() => setRecommendation(option)}
            />
            {option}
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
