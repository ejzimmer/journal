import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PlusIcon } from '../../shared/icons/Plus';
import { Exercise, ExerciseUpdate } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { ExerciseForm } from './ExerciseForm';
import { UpdateChip } from './UpdateChip';

type ActiveForm = { kind: 'record' } | { kind: 'edit'; update: ExerciseUpdate };

export function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const { recordExercise, editExerciseUpdate, deleteExerciseUpdate } =
    useHealthStorage();
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
  const nameId = useId();
  const updatesRef = useRef<HTMLUListElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const formTriggerRef = useRef<HTMLButtonElement>(null);

  const updates = useMemo(
    () =>
      Object.values(exercise.updates ?? {}).sort((a, b) =>
        Temporal.PlainDate.compare(a.date, b.date),
      ),
    [exercise.updates],
  );

  useLayoutEffect(() => {
    const list = updatesRef.current;
    if (list) {
      list.scrollLeft = list.scrollWidth;
    }
  }, [updates.length]);

  const editingId =
    activeForm?.kind === 'edit' ? activeForm.update.id : undefined;

  const openForm = (form: ActiveForm, trigger: HTMLButtonElement) => {
    formTriggerRef.current = trigger;
    setActiveForm(form);
  };

  const closeForm = (focusTarget = formTriggerRef.current) => {
    flushSync(() => setActiveForm(null));
    focusTarget?.focus();
  };

  const toggleEditForm = (
    update: ExerciseUpdate,
    trigger: HTMLButtonElement,
  ) => {
    if (editingId === update.id) {
      closeForm();
    } else {
      openForm({ kind: 'edit', update }, trigger);
    }
  };

  const toggleRecordForm = (trigger: HTMLButtonElement) => {
    if (activeForm?.kind === 'record') {
      closeForm();
    } else {
      openForm({ kind: 'record' }, trigger);
    }
  };

  const addUpdate = (update: Omit<ExerciseUpdate, 'id'>) => {
    recordExercise(exercise.id, update);
    closeForm();
  };

  const saveUpdate = (edited: Omit<ExerciseUpdate, 'id'>) => {
    if (activeForm?.kind === 'edit') {
      editExerciseUpdate(exercise.id, { id: activeForm.update.id, ...edited });
    }
    closeForm();
  };

  const deleteUpdate = (update: ExerciseUpdate) => {
    deleteExerciseUpdate(exercise.id, update);
    closeForm(recordButtonRef.current);
  };

  return (
    <li className="exercise" aria-labelledby={nameId}>
      <span id={nameId} className="name">
        {exercise.name}
      </span>
      <ul className="updates" ref={updatesRef}>
        {updates.map((update) => (
          <li key={update.id}>
            <UpdateChip
              update={update}
              isEditing={editingId === update.id}
              onClick={(event) => toggleEditForm(update, event.currentTarget)}
            />
          </li>
        ))}
      </ul>
      <button
        ref={recordButtonRef}
        className="record"
        aria-label={`Record ${exercise.name}`}
        aria-expanded={activeForm?.kind === 'record'}
        onClick={(event) => toggleRecordForm(event.currentTarget)}
      >
        <PlusIcon strokeWidth="3" />
      </button>
      {activeForm?.kind === 'record' && (
        <ExerciseForm
          exerciseName={exercise.name}
          onSubmit={addUpdate}
          onCancel={() => closeForm()}
        />
      )}
      {activeForm?.kind === 'edit' && (
        <ExerciseForm
          key={activeForm.update.id}
          exerciseName={exercise.name}
          update={activeForm.update}
          onSubmit={saveUpdate}
          onCancel={() => closeForm()}
          onDelete={() => deleteUpdate(activeForm.update)}
        />
      )}
    </li>
  );
}
