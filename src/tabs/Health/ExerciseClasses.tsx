import { ReactElement, useMemo } from 'react';
import { ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { ExerciseClassCard } from './ExerciseClassCard';
import { AddExerciseClass } from './AddExerciseClass';
import { PistolBoxCard } from './PistolBoxCard';
import { DeadHangCard } from './DeadHangCard';
import { isClassDone } from './isClassDone';
import { isBoxCleared, STARTING_PISTOL_BOX } from './pistolBox';
import { getTodaysHangs, isDeadHangSessionDone } from './deadHang';
import './ExerciseClasses.css';

const MIN_SET_CLASS_COLUMNS = 4;

type Card = {
  isDone: boolean;
  element: ReactElement;
};

export function ExerciseClasses() {
  const { classes, pistolBox, deadHang } = useHealthStorage();
  const countSetClassColumns = useMemo(
    () => createSetClassColumnCounter(classes),
    [classes],
  );

  const classCards: Card[] = classes.map((exerciseClass) => ({
    isDone: isClassDone(exerciseClass),
    element: (
      <ExerciseClassCard
        key={exerciseClass.id}
        exerciseClass={exerciseClass}
        countSetClassColumns={countSetClassColumns}
      />
    ),
  }));
  const trackerCards: Card[] = [
    {
      isDone: isBoxCleared(pistolBox ?? STARTING_PISTOL_BOX),
      element: <PistolBoxCard key="pistol-box" />,
    },
    {
      isDone: isDeadHangSessionDone(getTodaysHangs(deadHang)),
      element: <DeadHangCard key="dead-hang" />,
    },
  ];
  const orderedCards = [
    ...classCards.filter(({ isDone }) => !isDone),
    ...trackerCards.filter(({ isDone }) => !isDone),
    ...classCards.filter(({ isDone }) => isDone),
    ...trackerCards.filter(({ isDone }) => isDone),
  ];

  return (
    <ul className="exercise-classes">
      {orderedCards.map(({ element }) => element)}
      <AddExerciseClass />
    </ul>
  );
}

function createSetClassColumnCounter(classes: ExerciseClass[]) {
  const tallestWeeklyClass = Math.max(
    1,
    ...classes
      .filter(({ blocks }) => blocks.length > 1)
      .map(({ blocks }) => blocks.length),
  );
  return (total: number) =>
    Math.max(MIN_SET_CLASS_COLUMNS, Math.ceil(total / tallestWeeklyClass));
}
