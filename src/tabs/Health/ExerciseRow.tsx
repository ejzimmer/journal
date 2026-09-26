import { useMemo } from 'react';
import { PlusIcon } from '../../shared/icons/Plus';
import { compareDates } from '../../shared/dates';
import { useFormToggle } from '../../shared/controls/useFormToggle';
import { Exercise, ExerciseUpdate } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { ExerciseForm } from './ExerciseForm';
import { UpdateCell } from './UpdateCell';

type ExerciseRowProps = {
  exercise: Exercise;
  numberOfUpdateColumns: number;
};

export function ExerciseRow({
  exercise,
  numberOfUpdateColumns,
}: ExerciseRowProps) {
  const { recordExercise } = useHealthStorage();
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();

  const updates = useMemo(
    () =>
      Object.values(exercise.updates ?? {}).sort((a, b) =>
        compareDates(a.date, b.date),
      ),
    [exercise.updates],
  );
  const trailingEmptyCells = Array.from({
    length: numberOfUpdateColumns - updates.length - 1,
  });

  const addUpdate = (update: Omit<ExerciseUpdate, 'id'>) => {
    recordExercise(exercise.id, update);
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
