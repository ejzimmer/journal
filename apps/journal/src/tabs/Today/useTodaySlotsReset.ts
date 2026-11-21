import { useStorageContext } from 'shared/FirebaseContext';
import { useDailyJob } from 'shared/dailyJobs/DailyJobsContext';
import {
  AMIMONO_PROJECTS_PATH,
  TODAY_SLOTS_KEY,
} from 'shared/todaySlots/types';
import {
  AmimonoProject,
  ProjectDetails,
  PROJECTS_KEY,
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
  const { value: amimonoProjects, synced: amimonoProjectsSynced } = useValue<
    Record<string, AmimonoProject>
  >(AMIMONO_PROJECTS_PATH);

  useDailyJob({
    lastRunKey: TODAY_SLOTS_RESET_KEY,
    isReady: slotsSynced && projectsSynced && amimonoProjectsSynced,
    run: () => {
      const projectsByPath = {
        [PROJECTS_KEY]: projects,
        [AMIMONO_PROJECTS_PATH]: amimonoProjects,
      };
      const doneSlots = Object.values(slots ?? {}).filter((slot) =>
        isSlotDone(slot, projectsByPath),
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
