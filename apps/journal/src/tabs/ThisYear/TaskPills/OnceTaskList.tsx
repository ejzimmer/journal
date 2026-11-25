import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { ONCE_KEY } from '../../../types';
import { useDailyTaskList } from '../../Todo/Today/useDailyTaskList';
import { OnceTaskPill } from './OnceTaskPill';

import './TaskPills.css';

export function OnceTaskList() {
  const { tasks, getReorderControls, updateTask } = useDailyTaskList(ONCE_KEY);
  const { hasFreeSlot, addGoal, removeGoal, hasGoal } = useDailyGoals();

  return (
    <ol className="task-pills">
      {tasks.map((task, index) => {
        const taskPath = `${ONCE_KEY}/${task.id}`;
        const isInSlot = hasGoal(taskPath);

        return (
          <li key={task.id} className={`task-pill status-${task.status}`}>
            <OnceTaskPill
              task={task}
              onChange={updateTask}
              reorder={getReorderControls(index)}
              isInSlot={isInSlot}
              canAddToSlot={hasFreeSlot}
              onToggleSlot={() =>
                isInSlot ? removeGoal(taskPath) : addGoal({ taskPath })
              }
            />
          </li>
        );
      })}
    </ol>
  );
}
