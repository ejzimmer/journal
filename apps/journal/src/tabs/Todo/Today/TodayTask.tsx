import { ReactNode } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { useFormToggle } from 'shared/controls/useFormToggle';
import { DailyTask } from '../../../types';
import { ReorderControls } from '../todoTypes';
import { toggleDailyTaskStatus } from './toggleDailyTaskStatus';
import { ReorderableItem } from './ReorderableItem';
import { TodayTaskEditor } from './TodayTaskEditor';
import { TodayTaskView } from './TodayTaskView';

import './TodayTask.css';

type TodayTaskProps = {
  task: DailyTask;
  listId: string;
  onChange: (task: DailyTask) => void;
  reorder?: ReorderControls;
  action?: ReactNode;
};

export function TodayTask({
  task,
  listId,
  onChange,
  reorder,
  action,
}: TodayTaskProps) {
  const { deleteItem } = useStorageContext();
  const {
    isFormOpen: isEditing,
    triggerRef: descriptionRef,
    openForm: startEditing,
    closeForm: stopEditing,
  } = useFormToggle();

  if (isEditing) {
    return (
      <TodayTaskEditor
        category={task.category}
        description={task.description}
        onChangeCategory={(category) => onChange({ ...task, category })}
        onChangeDescription={(description) => {
          if (description === '') {
            deleteItem<DailyTask>(listId, task);
          } else {
            onChange({ ...task, description });
          }
        }}
        onClose={stopEditing}
      />
    );
  }

  const view = (
    <>
      <TodayTaskView
        category={task.category}
        description={task.description}
        isChecked={task.status !== 'ready'}
        descriptionRef={descriptionRef}
        onToggle={() => onChange(toggleDailyTaskStatus(task))}
        onEdit={startEditing}
      />
      {action}
    </>
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
