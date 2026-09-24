import { SubmitEvent, useContext, useMemo, useRef } from 'react';

import './ThisWeekTask.css';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { WEEKLY_KEY, WeeklyTask } from '../../../shared/types';
import { Combobox } from '../../../shared/controls/combobox/Combobox';
import { CategoriesContext } from '..';
import { ProgressIndicator } from './ProgressIndicator';
import { getTimestampFromDate, getToday } from '../../../shared/dates';
import { useFormToggle } from '../../../shared/controls/useFormToggle';
import { getCompletedDates } from './utils';

export function ThisWeekTask({ task }: { task: WeeklyTask }) {
  const {
    isFormOpen: inEditMode,
    triggerRef: descriptionDisplayRef,
    openForm: switchToEditMode,
    closeForm: switchToViewMode,
    openFormOnEnterOrSpace,
  } = useFormToggle<HTMLDivElement>();

  const descriptionRef = useRef<HTMLInputElement>(null);
  const frequencyRef = useRef<HTMLInputElement>(null);

  const { updateItem, deleteItem } = useStorageContext();
  const onChange = (task: WeeklyTask) => {
    updateItem<WeeklyTask>(WEEKLY_KEY, task);
  };

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!descriptionRef.current || !frequencyRef.current) {
      return;
    }

    const description = descriptionRef.current.value;
    if (!description) {
      deleteItem<WeeklyTask>(WEEKLY_KEY, task);
      return;
    }

    const frequency = Number.parseInt(frequencyRef.current.value);
    if (
      description === task.description &&
      (frequency === task.frequency || isNaN(frequency))
    ) {
      switchToViewMode();
      return;
    }

    updateItem<WeeklyTask>(WEEKLY_KEY, {
      ...task,
      description: descriptionRef.current.value,
      frequency: isNaN(frequency) ? task.frequency : frequency,
    });

    switchToViewMode();
  };

  const categories = useContext(CategoriesContext);
  if (!categories) {
    throw new Error('Missing categories context provider');
  }
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category, label: category })),
    [categories],
  );

  const completedDates = getCompletedDates(task.completed);

  const addDone = (event: React.MouseEvent) => {
    const completedDate = event.ctrlKey
      ? getTimestampFromDate(getToday().subtract({ days: 1 }))
      : Date.now();

    onChange({ ...task, completed: [...completedDates, completedDate] });
  };

  const removeLastDone = () => {
    onChange({ ...task, completed: completedDates.slice(0, -1) });
  };

  const handleClick = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      removeLastDone();
    } else {
      addDone(event);
    }
  };

  const handleClose = ({ key }: React.KeyboardEvent<HTMLFormElement>) => {
    if (key === 'Escape') {
      switchToViewMode();
    }
  };

  if (inEditMode) {
    return (
      <form
        className="edit-this-week-task"
        onSubmit={onSubmit}
        onKeyDown={handleClose}
      >
        <Combobox
          value={{ id: task.category, label: task.category }}
          options={categoryOptions}
          createOption={(value) => ({ id: value, label: value })}
          onChange={(value) => {
            onChange({ ...task, category: value.id });
            switchToViewMode();
          }}
          inputSize={1}
          ariaLabel="Category"
        />
        <input
          ref={descriptionRef}
          autoFocus
          aria-label="Description"
          defaultValue={task.description}
        />
        <input
          ref={frequencyRef}
          type="number"
          aria-label="Frequency"
          defaultValue={task.frequency}
          size={2}
        />
        <button>submit</button>
      </form>
    );
  }

  return (
    <>
      <button onClick={handleClick} className="icon subtle">
        {task.category}
      </button>
      <div style={{ flexGrow: 1 }}>
        <div
          ref={descriptionDisplayRef}
          role="button"
          tabIndex={0}
          aria-label={task.description}
          onClick={switchToEditMode}
          onKeyDown={openFormOnEnterOrSpace}
        >
          {task.description}
        </div>
      </div>
      <ProgressIndicator
        completed={task.completed}
        frequency={task.frequency}
        description={task.description}
        onAdd={addDone}
        onRemove={removeLastDone}
      />
    </>
  );
}
