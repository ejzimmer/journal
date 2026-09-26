import { useMemo, useState } from 'react';
import { useHealthStorage } from '../HealthStorageContext';
import { setupDays } from '../utils';
import { Switch } from '../../../shared/controls/Switch';
import { Days } from './Days';
import { WeeklyCalorieTracker } from './WeeklyCalorieTracker';
import { CalorieForm } from './CalorieForm';
import './Calories.css';

type View = '週' | '日';

export function Calories() {
  const [view, setView] = useState<View>('週');
  const [dismissed, setDismissed] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const { days: storedDays, isLoading, updateDay } = useHealthStorage();

  const days = useMemo(() => setupDays(storedDays), [storedDays]);
  const yesterday = days[days.length - 1];
  const yesterdayId = yesterday && yesterday.id;
  const caloriesRecordedYesterday = typeof yesterday?.diff === 'number';

  const activeDayId =
    selectedDayId ??
    (!isLoading && yesterdayId && !caloriesRecordedYesterday && !dismissed
      ? yesterdayId
      : null);
  const activeDay = activeDayId
    ? days.find((day) => day.id === activeDayId)
    : undefined;
  const activeDayData = activeDayId ? storedDays?.[activeDayId] : undefined;

  const closeForm = () => {
    if (selectedDayId) {
      setSelectedDayId(null);
    } else {
      setDismissed(true);
    }
  };

  return (
    <div>
      <div className="tracker-switch">
        <Switch
          options={['週', '日']}
          value={view}
          onChange={setView}
          name="tracker-view"
        />
      </div>
      <div className="tracker-stage">
        <div
          className={`tracker-pane ${view === '日' ? 'active' : ''}`}
          aria-hidden={view !== '日'}
        >
          <Days days={days} onSelectDay={setSelectedDayId} />
        </div>
        <div
          className={`tracker-pane ${view === '週' ? 'active' : ''}`}
          aria-hidden={view !== '週'}
        >
          <WeeklyCalorieTracker days={days} />
        </div>
        {activeDay && activeDayId && (
          <CalorieForm
            key={activeDayId}
            date={{ day: activeDay.day, month: activeDay.month }}
            consumed={activeDayData?.consumed}
            expended={activeDayData?.expended}
            trackers={activeDayData?.trackers}
            onClose={closeForm}
            onSubmit={({ consumed, expended, trackers }) => {
              updateDay({
                ...(activeDayData ?? { id: activeDayId }),
                id: activeDayId,
                consumed,
                expended,
                trackers,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
