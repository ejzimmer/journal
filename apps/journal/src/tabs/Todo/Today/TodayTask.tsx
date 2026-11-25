import { useFormToggle } from 'shared/controls/useFormToggle';
import { DailyTask } from '../../../types';
import { ReorderControls } from '../todoTypes';
import { toggleDailyTaskStatus } from './toggleDailyTaskStatus';
import { DailyTaskEditor } from './DailyTaskEditor';
import { ReorderableItem } from './ReorderableItem';
import { TodayTaskView } from './TodayTaskView';

import './TodayTask.css';

type TodayTaskProps = {
  task: DailyTask;
  listId: string;
  onChange: (task: DailyTask) => void;
  reorder?: ReorderControls;
};

export function TodayTask({ task, listId, onChange, reorder }: TodayTaskProps) {
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
        listId={listId}
        onChange={onChange}
        onClose={stopEditing}
      />
    );
  }

  const view = (
    <TodayTaskView
      category={task.category}
      description={task.description}
      isChecked={task.status !== 'ready'}
      descriptionRef={descriptionRef}
      onToggle={() => onChange(toggleDailyTaskStatus(task))}
      onEdit={startEditing}
    />
  );

  return reorder ? (
    <ReorderableItem
      className="today-task-description"
      label={task.description}
      reorder={reorder}
    >
      {view}
    </ReorderableItem>
  ) : (
    <div className="today-task-description">{view}</div>
  );
}
