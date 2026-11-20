import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import {
  ProjectDetails,
  PROJECTS_KEY,
  TODAY_SLOTS_KEY,
  TODAY_SLOTS_RESET_KEY,
  TodaySlot,
} from '../../types';
import { isSlotDone } from './slots';

export function useTodaySlotsReset() {
  const { useValue, setValues } = useStorageContext();
  const { value: slots, synced: slotsSynced } =
    useValue<Record<string, TodaySlot>>(TODAY_SLOTS_KEY);
  const { value: projects, synced: projectsSynced } =
    useValue<Record<string, ProjectDetails>>(PROJECTS_KEY);

  useDailyJob({
    lastRunKey: TODAY_SLOTS_RESET_KEY,
    isReady: slotsSynced && projectsSynced,
    run: () => {
      const doneSlots = Object.values(slots ?? {}).filter((slot) =>
        isSlotDone(slot, projects),
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
