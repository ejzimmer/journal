import { useId, useState } from 'react';
import { AddTaskForm } from '../AddTaskForm';
import { CALENDAR_KEY } from '../../../shared/types';
import { FormControl } from '../../../shared/controls/FormControl';
import { getToday } from '../../../shared/dates';
import { TickIcon } from '../../../shared/icons/Tick';

export function AddDueDateTaskForm() {
  const [dueDate, setDueDate] = useState(getToday());
  const [repeats, setRepeats] = useState(false);
  const repeatsId = useId();

  const getAdditionalFieldValue = () => {
    if (!dueDate) {
      return false;
    }

    return { dueDate, repeats };
  };

  return (
    <AddTaskForm
      listId={CALENDAR_KEY}
      getAdditionalFieldValues={getAdditionalFieldValue}
    >
      <FormControl
        label="Due date"
        type="date"
        value={dueDate}
        onChange={setDueDate}
      />
      <div className="form-control repeats">
        <label htmlFor={repeatsId}>Repeats</label>
        <div className="box">
          <input
            id={repeatsId}
            type="checkbox"
            checked={repeats}
            onChange={(event) => setRepeats(event.target.checked)}
          />
          <TickIcon width="20px" />
        </div>
      </div>
    </AddTaskForm>
  );
}
