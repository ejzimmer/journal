import { useStorageContext } from 'shared/FirebaseContext';

import './TodayTask.css';
import { DailyTask } from '../../../types';
import { TodayTaskDescription } from './TodayTaskDescription';
import { toggleDailyTaskStatus } from './toggleDailyTaskStatus';

type TodayTaskProps = {
  task: DailyTask;
  listId: string;
  onChange: (task: DailyTask) => void;
};

export function TodayTask({ task, listId, onChange }: TodayTaskProps) {
  const { deleteItem } = useStorageContext();

  return (
    <TodayTaskDescription
      category={task.category}
      description={task.description}
      isChecked={task.status !== 'ready'}
      onChange={(change) => {
        if ('isChecked' in change) {
          onChange(toggleDailyTaskStatus(task));
        } else if ('description' in change && change.description === '') {
          deleteItem<DailyTask>(listId, task);
        } else {
          onChange({ ...task, ...change });
        }
      }}
    />
  );
}
