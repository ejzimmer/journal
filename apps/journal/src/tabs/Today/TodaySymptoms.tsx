import { useStorageContext } from 'shared/FirebaseContext';
import { getToday } from 'shared/dates';
import { DAILY_PATH, DayData } from '../../types';
import { SymptomPicker } from '../Health/calories/SymptomPicker';

export function TodaySymptoms() {
  const { useValue, updateItem } = useStorageContext();
  const todayId = getToday();
  const { value: today } = useValue<DayData>(`${DAILY_PATH}/${todayId}`);

  return (
    <SymptomPicker
      trackers={today?.trackers ?? []}
      onChange={(trackers) =>
        updateItem<DayData>(DAILY_PATH, { ...today, id: todayId, trackers })
      }
    />
  );
}
