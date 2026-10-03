import { useMemo } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { Book, Reading } from './Reading';

import './index.css';
import { Bikes, BikesGoal } from './Bikes';
import { GameGoal, GameGoalData } from './GameGoals';

type Goal = Book | BikesGoal | GameGoalData;

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

const isBook = (goal: Goal): goal is Book => 'title' in goal;
const isBikes = (goal: Goal): goal is BikesGoal =>
  'bikes' in goal && Array.isArray(goal.bikes);
const isGame = (goal: Goal): goal is GameGoalData =>
  'name' in goal && goal.name === 'Wind Waker';

const getComponent = (goal: Goal, onUpdate: (goal: Goal) => void) => {
  if (isBook(goal)) {
    return <Reading book={goal} onChange={onUpdate} />;
  } else if (isBikes(goal)) {
    return <Bikes goal={goal} onChange={onUpdate} />;
  } else if (isGame(goal)) {
    return <GameGoal goal={goal} onChange={onUpdate} />;
  }
  return null;
};

function isDone(task: any) {
  if ('volumes' in task && Array.isArray(task.volumes)) {
    return task.volumes.every(
      (volume: { readPages: number; totalPages: number }) =>
        volume.readPages === volume.totalPages,
    );
  }

  if ('bikes' in task && Array.isArray(task.bikes)) {
    return task.bikes.every((bike: { isDone: boolean }) => bike.isDone);
  }
  return false;
}
