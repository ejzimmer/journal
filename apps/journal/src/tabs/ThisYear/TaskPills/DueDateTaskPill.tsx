import { useFormToggle } from 'shared/controls/useFormToggle';
import { useStorageContext } from 'shared/FirebaseContext';
import { PauseButtonIcon } from 'shared/icons/PauseButton';
import { CalendarTask, CALENDAR_KEY } from '../../../types';
import { TodayTaskView } from '../../Todo/Today/TodayTaskView';
import { useDueDateStatusChange } from '../../Todo/DueDate/useDueDateStatusChange';
import { DueDateChip } from './DueDateChip';
import { DueDateTaskEditor } from './DueDateTaskEditor';
import { LatchButton } from './LatchButton';

import './DueDateTaskPill.css';

type DueDateTaskPillProps = { task: CalendarTask };

export function DueDateTaskPill({ task }: DueDateTaskPillProps) {
  const {
    isFormOpen: isEditing,
    triggerRef: descriptionRef,
    openForm: startEditing,
    closeForm: stopEditing,
  } = useFormToggle();
  const { updateItem, deleteItem } = useStorageContext();
  const changeStatus = useDueDateStatusChange(task);

  if (isEditing) {
    return (
      <DueDateTaskEditor
        task={task}
        onChange={(task) => updateItem<CalendarTask>(CALENDAR_KEY, task)}
        onDelete={() => deleteItem<CalendarTask>(CALENDAR_KEY, task)}
        onClose={stopEditing}
      />
    );
  }

  const isFinished = task.status === 'finished';
  const isPaused = task.status === 'paused';

  return (
    <div
      className={`today-task-description has-end-control due-date-task-pill${isPaused ? ' is-paused' : ''}`}
    >
      <TodayTaskView
        category={task.category}
        description={task.description}
        isChecked={isFinished}
        descriptionRef={descriptionRef}
        onToggle={() => changeStatus(isFinished ? 'ready' : 'finished')}
        onEdit={startEditing}
      />
      <DueDateChip dueDate={task.dueDate} isFinished={isFinished} />
      <LatchButton
        label={`Pause ${task.description}`}
        isPressed={isPaused}
        onClick={() => changeStatus(isPaused ? 'ready' : 'paused')}
      >
        <PauseButtonIcon width="12px" />
      </LatchButton>
    </div>
  );
}
