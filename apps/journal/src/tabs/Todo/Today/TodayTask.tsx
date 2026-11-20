import { useStorageContext } from 'shared/FirebaseContext';

import './TodayTask.css';
import { DailyTask } from '../../../types';
import { TodayTaskDescription } from './TodayTaskDescription';
import { getToday } from 'shared/dates';

type TodayTaskProps = {
  task: DailyTask;
  listId: string;
  onChange: (task: DailyTask) => void;
};

export function TodayTask({ task, listId, onChange }: TodayTaskProps) {
  const { deleteItem } = useStorageContext();

  const handleStatusChange = () => {
    if (task.status !== 'ready') {
      onChange({
        ...task,
        status: 'ready',
        lastCompleted: getToday(),
      });
    } else {
      onChange({
        ...task,
        status: task.type === '毎日' ? 'done' : 'finished',
        lastCompleted: getToday(),
      });
    }
  };

  return (
    <TodayTaskDescription
      category={task.category}
      description={task.description}
      isChecked={task.status !== 'ready'}
      onChange={(change) => {
        if ('isChecked' in change) {
          handleStatusChange();
        } else if ('description' in change && change.description === '') {
          deleteItem<DailyTask>(listId, task);
        } else {
          onChange({ ...task, ...change });
        }
      }}
    />
  );
}
