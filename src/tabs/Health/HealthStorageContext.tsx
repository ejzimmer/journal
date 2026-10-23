import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../shared/FirebaseContext';
import {
  CLASSES_PATH,
  DAILY_PATH,
  DayData,
  DEAD_HANG_PATH,
  DeadHangSession,
  Exercise,
  ExerciseClass,
  EXERCISES_PATH,
  ExerciseUpdate,
  PISTOL_BOX_PATH,
} from '../../shared/types';

export type HealthStorageContextType = {
  days?: Record<string, DayData>;
  exercises: Exercise[];
  classes: ExerciseClass[];
  pistolBoxLevel?: number;
  deadHang?: DeadHangSession;
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
  updatePistolBoxLevel: (level: number) => void;
  updateDeadHang: (deadHang: DeadHangSession) => void;
};

export const HealthStorageContext = createContext<
  HealthStorageContextType | undefined
>(undefined);

const sortExercisesByPosition = (exercises: Record<string, Exercise> = {}) =>
  Object.values(exercises).toSorted(
    (a, b) => (a.position ?? -1) - (b.position ?? -1),
  );

const getNextExercisePosition = (exercises: Exercise[]) =>
  Math.max(-1, ...exercises.map(({ position }) => position ?? -1)) + 1;

export function HealthStorageProvider({ children }: { children: ReactNode }) {
  const { addItem, updateItem, deleteItem, setValue, useValue } =
    useStorageContext();

  const { value: days, loading: daysLoading } =
    useValue<Record<string, DayData>>(DAILY_PATH);
  const { value: storedExercises, loading: exercisesLoading } =
    useValue<Record<string, Exercise>>(EXERCISES_PATH);
  const { value: storedClasses, loading: classesLoading } =
    useValue<Record<string, ExerciseClass>>(CLASSES_PATH);
  const { value: pistolBoxLevel, loading: pistolBoxLoading } =
    useValue<number>(PISTOL_BOX_PATH);
  const { value: deadHang, loading: deadHangLoading } =
    useValue<DeadHangSession>(DEAD_HANG_PATH);

  const exercises = useMemo(
    () => sortExercisesByPosition(storedExercises),
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
    pistolBoxLevel,
    deadHang,
    isLoading:
      daysLoading ||
      exercisesLoading ||
      classesLoading ||
      pistolBoxLoading ||
      deadHangLoading,

    updateDay: (day) => updateItem<DayData>(DAILY_PATH, day),
    addExercise: (name) => {
      addItem<Exercise>(EXERCISES_PATH, {
        name,
        position: getNextExercisePosition(exercises),
      });
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
    updatePistolBoxLevel: (level) => setValue<number>(PISTOL_BOX_PATH, level),
    updateDeadHang: (session) =>
      setValue<DeadHangSession>(DEAD_HANG_PATH, session),
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
