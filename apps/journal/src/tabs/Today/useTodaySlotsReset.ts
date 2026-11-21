import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import { isSubtaskSlot, TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { TODAY_SLOTS_RESET_KEY, TodaySlot } from '../../types';
import { useSlotSubtaskStatuses } from './useSlotSubtaskStatuses';

export function useTodaySlotsReset() {
  const { useValue, setValues } = useStorageContext();
  const { value: slots, synced: slotsSynced } =
    useValue<Record<string, TodaySlot>>(TODAY_SLOTS_KEY);
  const slotList = Object.values(slots ?? {});
  const subtaskStatuses = useSlotSubtaskStatuses(
    slotList.filter(isSubtaskSlot),
  );

  useDailyJob({
    lastRunKey: TODAY_SLOTS_RESET_KEY,
    isReady: slotsSynced && subtaskStatuses.synced,
    run: () => {
      const doneSlots = slotList.filter(
        (slot) =>
          (isSubtaskSlot(slot)
            ? subtaskStatuses.findStatus(slot)
            : slot.status) !== 'ready',
      );
      if (doneSlots.length === 0) return;

      setValues(
        Object.fromEntries(
          doneSlots.map((slot) => [`${TODAY_SLOTS_KEY}/${slot.id}`, null]),
        ),
      );
    },
  });
}
