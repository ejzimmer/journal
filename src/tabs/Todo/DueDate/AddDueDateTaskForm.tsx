import { useState } from 'react';
import { AddTaskForm } from '../AddTaskForm';
import { CALENDAR_KEY } from '../../../shared/types';
import { FormControl } from '../../../shared/controls/FormControl';
import { getToday } from '../../../shared/dates';

export function AddDueDateTaskForm() {
  const [dueDate, setDueDate] = useState(getToday());
  const [repeats, setRepeats] = useState(false);

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
      <div className="due-date-fields">
        <FormControl
          label="Due date"
          type="date"
          value={dueDate}
          onChange={setDueDate}
        />
        <label className="repeats">
          <input
            type="checkbox"
            checked={repeats}
            onChange={(event) => setRepeats(event.target.checked)}
          />
          Repeats weekly
        </label>
      </div>
    </AddTaskForm>
  );
}
