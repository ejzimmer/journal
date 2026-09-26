import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../shared/FirebaseContext';
import {
  DAILY_PATH,
  DayData,
  Exercise,
  EXERCISES_PATH,
  ExerciseUpdate,
} from '../../shared/types';

export type HealthStorageContextType = {
  days?: Record<string, DayData>;
  exercises: Exercise[];
  isLoading: boolean;

  updateDay: (day: DayData) => void;
  addExercise: (name: string) => void;
  recordExercise: (
    exerciseId: string,
    update: Omit<ExerciseUpdate, 'id'>,
  ) => void;
};

export const HealthStorageContext = createContext<
  HealthStorageContextType | undefined
>(undefined);

export function HealthStorageProvider({ children }: { children: ReactNode }) {
  const { addItem, updateItem, useValue } = useStorageContext();

  const { value: days, loading: daysLoading } =
    useValue<Record<string, DayData>>(DAILY_PATH);
  const { value: storedExercises, loading: exercisesLoading } =
    useValue<Record<string, Exercise>>(EXERCISES_PATH);

  const exercises = useMemo(
    () => Object.values(storedExercises ?? {}),
    [storedExercises],
  );

  const value: HealthStorageContextType = {
    days,
    exercises,
    isLoading: daysLoading || exercisesLoading,

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
