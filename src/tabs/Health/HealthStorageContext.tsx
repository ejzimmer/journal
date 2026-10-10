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
  PistolBox,
} from '../../shared/types';

export type HealthStorageContextType = {
  days?: Record<string, DayData>;
  exercises: Exercise[];
  classes: ExerciseClass[];
  pistolBox?: PistolBox;
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
  setPistolBox: (pistolBox: PistolBox) => void;
  setDeadHang: (deadHang: DeadHangSession) => void;
};

export const HealthStorageContext = createContext<
  HealthStorageContextType | undefined
>(undefined);

export function HealthStorageProvider({ children }: { children: ReactNode }) {
  const { addItem, updateItem, deleteItem, setValue, useValue } =
    useStorageContext();

  const { value: days, loading: daysLoading } =
    useValue<Record<string, DayData>>(DAILY_PATH);
  const { value: storedExercises, loading: exercisesLoading } =
    useValue<Record<string, Exercise>>(EXERCISES_PATH);
  const { value: storedClasses, loading: classesLoading } =
    useValue<Record<string, ExerciseClass>>(CLASSES_PATH);
  const { value: pistolBox, loading: pistolBoxLoading } =
    useValue<PistolBox>(PISTOL_BOX_PATH);
  const { value: deadHang, loading: deadHangLoading } =
    useValue<DeadHangSession>(DEAD_HANG_PATH);

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
    pistolBox,
    deadHang,
    isLoading:
      daysLoading ||
      exercisesLoading ||
      classesLoading ||
      pistolBoxLoading ||
      deadHangLoading,

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
    setPistolBox: (box) => setValue<PistolBox>(PISTOL_BOX_PATH, box),
    setDeadHang: (session) =>
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
