import { formatDate } from '../../shared/dates';
import { useFormToggle } from '../../shared/controls/useFormToggle';
import { Exercise, ExerciseUpdate } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { ExerciseForm } from './ExerciseForm';
import { RecommendationIcon } from './RecommendationIcon';

type UpdateCellProps = {
  exercise: Exercise;
  update: ExerciseUpdate;
};

export function UpdateCell({ exercise, update }: UpdateCellProps) {
  const { editExerciseUpdate, deleteExerciseUpdate } = useHealthStorage();
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();
  const { day, month, year } = formatDate(Temporal.PlainDate.from(update.date));

  const saveUpdate = (edited: Omit<ExerciseUpdate, 'id'>) => {
    editExerciseUpdate(exercise.id, { id: update.id, ...edited });
    closeForm();
  };

  if (isFormOpen) {
    return (
      <td>
        <ExerciseForm
          exerciseName={exercise.name}
          update={update}
          onSubmit={saveUpdate}
          onCancel={closeForm}
          onDelete={() => deleteExerciseUpdate(exercise.id, update)}
        />
      </td>
    );
  }

  return (
    <td>
      <button ref={triggerRef} className="update" onClick={openForm}>
        <div className="date">
          {day} {month} {year}
        </div>
        {update.details}
        {update.recommendation && (
          <RecommendationIcon recommendation={update.recommendation} />
        )}
      </button>
    </td>
  );
}
