import { useState } from 'react';
import { AddTaskForm } from '../AddTaskForm';
import { CALENDAR_KEY } from '../../../shared/types';
import { FormControl } from '../../../shared/controls/FormControl';
import { getToday } from '../../../shared/dates';

export function AddDueDateTaskForm() {
  const [dueDate, setDueDate] = useState(getToday());

  const getAdditionalFieldValue = () => {
    if (!dueDate) {
      return false;
    }

    return { dueDate };
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
    </AddTaskForm>
  );
}
