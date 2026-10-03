import { ExerciseClass } from '../../shared/types';
import { PlusIcon } from '../../shared/icons/Plus';
import { useFormToggle } from '../../shared/controls/useFormToggle';
import { useHealthStorage } from './HealthStorageContext';
import { ExerciseClassForm } from './ExerciseClassForm';

export function AddExerciseClass() {
  const { addClass } = useHealthStorage();
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();

  const saveClass = (exerciseClass: Omit<ExerciseClass, 'id'>) => {
    addClass(exerciseClass);
    closeForm();
  };

  return (
    <li className="add-exercise-class">
      {isFormOpen ? (
        <ExerciseClassForm onSubmit={saveClass} onCancel={closeForm} />
      ) : (
        <button
          ref={triggerRef}
          className="add-class"
          aria-label="Add class"
          onClick={openForm}
        >
          <PlusIcon strokeWidth="3" />
        </button>
      )}
    </li>
  );
}
