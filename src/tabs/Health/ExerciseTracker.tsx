import { FormEvent, JSX, useMemo, useState } from 'react';
import { PlusIcon } from '../../shared/icons/Plus';
import { ChevronUpIcon } from '../../shared/icons/ChevronUp';
import { ChevronDownIcon } from '../../shared/icons/ChevronDown';
import { IconProps } from '../../shared/icons/types';
import { compareDates, formatDate, getPlainDate } from '../../shared/dates';
import { useStorageContext } from '../../shared/FirebaseContext';
import { useFormToggle } from '../../shared/controls/useFormToggle';
import {
  Exercise,
  EXERCISES_PATH,
  ExerciseUpdate,
  Recommendation,
} from '../../shared/types';
import { ExerciseForm } from './ExerciseForm';
import './ExerciseTracker.css';

export function ExerciseTracker() {
  const { useValue, addItem } = useStorageContext();
  const { value } = useValue<Record<string, Exercise>>(EXERCISES_PATH);

  const exercises = useMemo(() => Object.values(value ?? {}), [value]);
  const numberOfUpdateColumns = Math.max(0, ...exercises.map(countUpdates)) + 1;

  return (
    <table className="exercise-tracker">
      <tbody>
        {exercises.map((exercise) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            numberOfUpdateColumns={numberOfUpdateColumns}
          />
        ))}
        <AddExerciseRow
          onAdd={(name) => addItem<Exercise>(EXERCISES_PATH, { name })}
        />
      </tbody>
    </table>
  );
}

const countUpdates = (exercise: Exercise) =>
  Object.keys(exercise.updates ?? {}).length;

const sortUpdatesByDate = (updates: Record<string, ExerciseUpdate> = {}) =>
  Object.values(updates).sort((a, b) => compareDates(a.date, b.date));

type ExerciseRowProps = {
  exercise: Exercise;
  numberOfUpdateColumns: number;
};

function ExerciseRow({ exercise, numberOfUpdateColumns }: ExerciseRowProps) {
  const { addItem } = useStorageContext();
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();

  const updates = useMemo(
    () => sortUpdatesByDate(exercise.updates),
    [exercise.updates],
  );
  const trailingEmptyCells = Array.from({
    length: numberOfUpdateColumns - updates.length - 1,
  });

  const addUpdate = (update: Omit<ExerciseUpdate, 'id'>) => {
    addItem<ExerciseUpdate>(`${EXERCISES_PATH}/${exercise.id}/updates`, update);
    closeForm();
  };

  return (
    <tr>
      <th role="rowheader">{exercise.name}</th>
      {updates.map((update) => (
        <UpdateCell key={update.id} update={update} />
      ))}
      <td className={isFormOpen ? '' : 'add-update'}>
        {isFormOpen ? (
          <ExerciseForm
            exerciseName={exercise.name}
            onSubmit={addUpdate}
            onCancel={closeForm}
          />
        ) : (
          <button
            ref={triggerRef}
            className="ghost"
            aria-label={`Record ${exercise.name}`}
            onClick={openForm}
          >
            <PlusIcon width="24px" strokeWidth="3" />
          </button>
        )}
      </td>
      {trailingEmptyCells.map((_, index) => (
        <td key={index} />
      ))}
    </tr>
  );
}

function UpdateCell({ update }: { update: ExerciseUpdate }) {
  const { day, month, year } = formatDate(getPlainDate(update.date));

  return (
    <td>
      <div className="date">
        {day} {month} {year}
      </div>
      {update.details}
      {update.recommendation && (
        <RecommendationIcon recommendation={update.recommendation} />
      )}
    </td>
  );
}

function RecommendationIcon({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const Icon = recommendationIcons[recommendation];

  return (
    <div className="recommendation">
      <Icon width="24px" colour="white" strokeWidth="6" />
      <Icon
        role="img"
        aria-label={recommendation}
        width="24px"
        colour="var(--action-colour)"
        strokeWidth="4"
      />
    </div>
  );
}

const recommendationIcons: Record<
  Recommendation,
  (props: IconProps) => JSX.Element
> = {
  increase: ChevronUpIcon,
  decrease: ChevronDownIcon,
};

function AddExerciseRow({ onAdd }: { onAdd: (name: string) => void }) {
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    onAdd(name.trim());
    setName('');
    closeForm();
  };

  return (
    <tr>
      <th className="add-exercise">
        {isFormOpen ? (
          <form
            aria-label="Add exercise"
            onSubmit={handleSubmit}
            onKeyDown={(event) => event.key === 'Escape' && closeForm()}
          >
            <input
              aria-label="Exercise name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </form>
        ) : (
          <button
            ref={triggerRef}
            className="ghost"
            aria-label="Add exercise"
            onClick={openForm}
          >
            <PlusIcon width="24px" strokeWidth="3" />
          </button>
        )}
      </th>
    </tr>
  );
}
