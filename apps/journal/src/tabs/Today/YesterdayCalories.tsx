import { FormEvent, useState } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { FormControl } from 'shared/controls/FormControl';
import { getDateDaysAgo } from 'shared/dates';
import { DAILY_PATH, DayData } from '../../types';

const parseCalories = (value: FormDataEntryValue | null) =>
  typeof value === 'string' && value ? Number.parseInt(value) : undefined;

export function YesterdayCalories() {
  const { useValue, updateItem } = useStorageContext();
  const yesterdayId = getDateDaysAgo(1);
  const { value: yesterday, synced } = useValue<DayData>(
    `${DAILY_PATH}/${yesterdayId}`,
  );
  const [isPoweringOff, setIsPoweringOff] = useState(false);

  const isComplete =
    typeof yesterday?.consumed === 'number' &&
    typeof yesterday?.expended === 'number';
  if ((!synced && !yesterday) || (isComplete && !isPoweringOff)) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const consumed = parseCalories(formData.get('consumed'));
    const expended = parseCalories(formData.get('expended'));
    const consumedSoFar = consumed ?? yesterday?.consumed;
    const expendedSoFar = expended ?? yesterday?.expended;

    updateItem<DayData>(DAILY_PATH, {
      ...yesterday,
      id: yesterdayId,
      ...(consumed !== undefined && { consumed }),
      ...(expended !== undefined && { expended }),
    });
    setIsPoweringOff(
      consumedSoFar !== undefined && expendedSoFar !== undefined,
    );
  };

  return (
    <form
      className={`yesterday-calories ${isPoweringOff ? 'powering-off' : ''}`}
      onSubmit={handleSubmit}
      onAnimationEnd={() => setIsPoweringOff(false)}
    >
      <FormControl
        hideLabel
        label="In"
        name="consumed"
        pattern="[0-9]{1,4}"
        defaultValue={`${yesterday?.consumed ?? ''}`}
        size={4}
      />
      <FormControl
        hideLabel
        label="Out"
        name="expended"
        pattern="[0-9]{1,4}"
        defaultValue={`${yesterday?.expended ?? ''}`}
        size={4}
      />
      <button type="submit" hidden />
    </form>
  );
}
