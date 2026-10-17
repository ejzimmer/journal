import { useState } from 'react';
import { LedSwitch } from '../LedSwitch';
import { AddTaskForm } from '../AddTaskForm';
import { DailyTaskDetails, DAILY_KEY } from '../../../shared/types';
import { getToday } from '../../../shared/dates';

export function AddTodayTaskForm() {
  const [taskType, setTaskType] = useState<DailyTaskDetails['type']>('一度');

  const getAdditionalFieldValues = () => {
    return {
      type: taskType,
      status: 'ready',
      lastCompleted: getToday(),
    };
  };

  return (
    <AddTaskForm
      listId={DAILY_KEY}
      getAdditionalFieldValues={getAdditionalFieldValues}
    >
      <fieldset>
        <legend className="label">Type</legend>
        <LedSwitch
          options={['一度', '毎日']}
          value={taskType}
          onChange={setTaskType}
          name="task-type"
        />
      </fieldset>
    </AddTaskForm>
  );
}
