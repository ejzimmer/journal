import { useMemo } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';

import './index.css';
import { Bikes, BikesGoal } from './Bikes';

type Goal = BikesGoal;

const path = '2026/other_goals';
const hasId = (book: Goal): book is Required<Goal> =>
  typeof book.id === 'string';

export function OtherGoals() {
  const { useValue, updateItem, addItem } = useStorageContext();

  const { value } = useValue<Record<string, Goal>>(path);
  const goals = useMemo(
    () =>
      value
        ? Object.values(value).toSorted((a, b) =>
            isDone(a) && isDone(b) ? 0 : isDone(a) ? 1 : -1,
          )
        : [],
    [value],
  );

  const onUpdate = (goal: Goal) => {
    if (hasId(goal)) {
      updateItem(path, goal);
    } else {
      addItem<Goal>(path, goal);
    }
  };

  return (
    <ul className="other-goals">
      {goals.map((goal) => (
        <li key={goal.id}>{getComponent(goal, onUpdate)}</li>
      ))}
    </ul>
  );
}

const isBikes = (goal: Goal): goal is BikesGoal =>
  'bikes' in goal && Array.isArray(goal.bikes);

const getComponent = (goal: Goal, onUpdate: (goal: Goal) => void) => {
  if (isBikes(goal)) {
    return <Bikes goal={goal} onChange={onUpdate} />;
  }
  return null;
};

function isDone(task: any) {
  if ('bikes' in task && Array.isArray(task.bikes)) {
    return task.bikes.every((bike: { isDone: boolean }) => bike.isDone);
  }
  return false;
}
