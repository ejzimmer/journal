import { useStorageContext } from 'shared/FirebaseContext';
import { DAILY_KEY, DailyTask } from '../../types';
import { toggleDailyTaskStatus } from '../Todo/Today/toggleDailyTaskStatus';
import { CheckableTask } from './CheckableTask';

type TodayDailyTaskProps = { task: DailyTask };

export function TodayDailyTask({ task }: TodayDailyTaskProps) {
  const { updateItem } = useStorageContext();

  return (
    <CheckableTask
      category={task.category}
      description={task.description}
      isChecked={task.status !== 'ready'}
      onToggle={() =>
        updateItem<DailyTask>(DAILY_KEY, toggleDailyTaskStatus(task))
      }
    />
  );
}
