import { useStorageContext } from '../../../shared/FirebaseContext';

import './TodayTask.css';
import { DailyTask, DAILY_KEY, ProjectSubtask } from '../../../shared/types';
import { EditableDescription } from '../../../shared/controls/EditableDescription';
import { getToday } from '../../../shared/dates';

export function TodayTask({
  task,
  onChange,
}: {
  task: DailyTask;
  onChange: (task: DailyTask) => void;
}) {
  const { useValue, updateItem, deleteItem } = useStorageContext();

  const { value: linkedTask } = useValue<ProjectSubtask>(task?.linkedTask);

  const handleStatusChange = () => {
    if (task.status !== 'ready') {
      onChange({
        ...task,
        status: 'ready',
        lastCompleted: getToday().toString(),
      });
    } else {
      onChange({
        ...task,
        status: task.type === '毎日' ? 'done' : 'finished',
        lastCompleted: getToday().toString(),
      });
    }

    if (task.linkedTask && linkedTask) {
      const segments = task.linkedTask.split('/');
      const path = segments.slice(0, segments.length - 1).join('/');

      updateItem<ProjectSubtask>(path, {
        ...linkedTask,
        status: task.status === 'finished' ? 'ready' : 'done',
      });
    }
  };

  return (
    <EditableDescription
      category={task.category}
      description={task.description}
      isChecked={task.status !== 'ready'}
      useTickForDone
      onChange={(change) => {
        if ('isChecked' in change) {
          handleStatusChange();
        } else if ('description' in change && change.description === '') {
          deleteItem<DailyTask>(DAILY_KEY, task);
        } else {
          onChange({ ...task, ...change });
        }
      }}
    />
  );
}
