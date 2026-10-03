import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../shared/FirebaseContext';
import {
  CLASSES_PATH,
  DAILY_PATH,
  DayData,
  Exercise,
  ExerciseClass,
  EXERCISES_PATH,
  ExerciseUpdate,
} from '../../shared/types';
import { useHealthDataMigration } from './useHealthDataMigration';

export type HealthStorageContextType = {
  days?: Record<string, DayData>;
  exercises: Exercise[];
  classes: ExerciseClass[];
  isLoading: boolean;

  updateDay: (day: DayData) => void;
  addExercise: (name: string) => void;
  recordExercise: (
    exerciseId: string,
    update: Omit<ExerciseUpdate, 'id'>,
  ) => void;
  editExerciseUpdate: (exerciseId: string, update: ExerciseUpdate) => void;
  deleteExerciseUpdate: (exerciseId: string, update: ExerciseUpdate) => void;
  addClass: (exerciseClass: Omit<ExerciseClass, 'id'>) => void;
  updateClass: (exerciseClass: ExerciseClass) => void;
};

export const HealthStorageContext = createContext<
  HealthStorageContextType | undefined
>(undefined);

export function HealthStorageProvider({ children }: { children: ReactNode }) {
  const { addItem, updateItem, deleteItem, useValue } = useStorageContext();
  useHealthDataMigration();

  const { value: days, loading: daysLoading } =
    useValue<Record<string, DayData>>(DAILY_PATH);
  const { value: storedExercises, loading: exercisesLoading } =
    useValue<Record<string, Exercise>>(EXERCISES_PATH);
  const { value: storedClasses, loading: classesLoading } =
    useValue<Record<string, ExerciseClass>>(CLASSES_PATH);

  const exercises = useMemo(
    () => Object.values(storedExercises ?? {}),
    [storedExercises],
  );
  const classes = useMemo(
    () => Object.values(storedClasses ?? {}),
    [storedClasses],
  );

  const value: HealthStorageContextType = {
    days,
    exercises,
    classes,
    isLoading: daysLoading || exercisesLoading || classesLoading,

    updateDay: (day) => updateItem<DayData>(DAILY_PATH, day),
    addExercise: (name) => {
      addItem<Exercise>(EXERCISES_PATH, { name });
    },
    recordExercise: (exerciseId, update) => {
      addItem<ExerciseUpdate>(
        `${EXERCISES_PATH}/${exerciseId}/updates`,
        update,
      );
    },
    editExerciseUpdate: (exerciseId, update) =>
      updateItem<ExerciseUpdate>(
        `${EXERCISES_PATH}/${exerciseId}/updates`,
        update,
      ),
    deleteExerciseUpdate: (exerciseId, update) =>
      deleteItem<ExerciseUpdate>(
        `${EXERCISES_PATH}/${exerciseId}/updates`,
        update,
      ),
    addClass: (exerciseClass) => {
      addItem<ExerciseClass>(CLASSES_PATH, exerciseClass);
    },
    updateClass: (exerciseClass) =>
      updateItem<ExerciseClass>(CLASSES_PATH, exerciseClass),
  };

  return (
    <HealthStorageContext.Provider value={value}>
      {children}
    </HealthStorageContext.Provider>
  );
}

export function useHealthStorage(): HealthStorageContextType {
  const context = useContext(HealthStorageContext);
  if (!context) {
    throw new Error('missing HealthStorageContext provider');
  }
  return context;
}
