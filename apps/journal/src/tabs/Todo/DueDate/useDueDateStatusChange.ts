import { useStorageContext } from 'shared/FirebaseContext';
import { getToday } from 'shared/dates';
import { CalendarTask, CALENDAR_KEY } from '../../../types';

const createNextOccurrence = ({
  id,
  dueDate,
  ...task
}: CalendarTask): Omit<CalendarTask, 'id'> => ({
  ...task,
  dueDate: Temporal.PlainDate.from(dueDate).add({ weeks: 1 }).toString(),
  status: 'ready',
});

export function useDueDateStatusChange(task: CalendarTask) {
  const { addItem, updateItem } = useStorageContext();

  return (status: CalendarTask['status']) => {
    const statusUpdateDate = getToday();

    if (status === 'finished' && task.repeats) {
      addItem<CalendarTask>(CALENDAR_KEY, {
        ...createNextOccurrence(task),
        statusUpdateDate,
      });
      updateItem(CALENDAR_KEY, {
        ...task,
        status,
        statusUpdateDate,
        repeats: false,
      });
    } else {
      updateItem(CALENDAR_KEY, { ...task, status, statusUpdateDate });
    }
  };
}
