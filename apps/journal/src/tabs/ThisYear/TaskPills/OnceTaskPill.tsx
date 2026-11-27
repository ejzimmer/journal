import { useFormToggle } from 'shared/controls/useFormToggle';
import { DailyTask, ONCE_KEY } from '../../../types';
import { ReorderControls } from '../../Todo/todoTypes';
import { DailyTaskEditor } from '../../Todo/Today/DailyTaskEditor';
import { ReorderableItem } from '../../Todo/Today/ReorderableItem';
import { TodayTaskView } from '../../Todo/Today/TodayTaskView';
import { toggleDailyTaskStatus } from '../../Todo/Today/toggleDailyTaskStatus';
import { ArrowSwitch } from './ArrowSwitch';

import './OnceTaskPill.css';

type OnceTaskPillProps = {
  task: DailyTask;
  onChange: (task: DailyTask) => void;
  reorder: ReorderControls;
  isInSlot: boolean;
  canAddToSlot: boolean;
  onToggleSlot: () => void;
};

export function OnceTaskPill({
  task,
  onChange,
  reorder,
  isInSlot,
  canAddToSlot,
  onToggleSlot,
}: OnceTaskPillProps) {
  const {
    isFormOpen: isEditing,
    triggerRef: descriptionRef,
    openForm: startEditing,
    closeForm: stopEditing,
  } = useFormToggle();

  if (isEditing) {
    return (
      <DailyTaskEditor
        task={task}
        listId={ONCE_KEY}
        onChange={onChange}
        onClose={stopEditing}
      />
    );
  }

  return (
    <ReorderableItem
      className="today-task-description has-end-control"
      label={task.description}
      reorder={reorder}
    >
      <TodayTaskView
        category={task.category}
        description={task.description}
        isChecked={task.status !== 'ready'}
        descriptionRef={descriptionRef}
        onToggle={() => onChange(toggleDailyTaskStatus(task))}
        onEdit={startEditing}
      />
      <ArrowSwitch
        label={`Do ${task.description} today`}
        isOn={isInSlot}
        isDisabled={!isInSlot && !canAddToSlot}
        className={task.status === 'ready' ? undefined : 'done-task-switch'}
        onClick={onToggleSlot}
      />
    </ReorderableItem>
  );
}
