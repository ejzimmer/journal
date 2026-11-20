import { FormEvent } from 'react';
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

  if (
    (!synced && !yesterday) ||
    (typeof yesterday?.consumed === 'number' &&
      typeof yesterday?.expended === 'number')
  ) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const consumed = parseCalories(formData.get('consumed'));
    const expended = parseCalories(formData.get('expended'));

    updateItem<DayData>(DAILY_PATH, {
      ...yesterday,
      id: yesterdayId,
      ...(consumed !== undefined && { consumed }),
      ...(expended !== undefined && { expended }),
    });
  };

  return (
    <form className="yesterday-calories" onSubmit={handleSubmit}>
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
