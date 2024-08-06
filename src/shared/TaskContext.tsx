import { createContext, useContext, useState } from "react";
import { TaskMetadata } from "../tabs/Projects/types";

export type TaskContextType = {
  getTask: (_id: string) => Promise<TaskMetadata>;
  changeDescription: (id: string, title: string) => void;
  changeDone: (id: string, isDone: boolean) => void;
  deleteTask: (id: string) => void;
  addSubTask: (id: string, description: string) => void;
};

const defaultContext = {
  getTask: (_id: string) =>
    Promise.resolve({ id: "", description: "", isDone: false }),
  changeDescription: (_id: string, _title: string) => undefined,
  changeDone: (_id: string, _isDone: boolean) => undefined,
  deleteTask: (_id: string) => undefined,
  addSubTask: (_id: string, _description: string) => undefined,
};

export const TaskContext = createContext<TaskContextType>(defaultContext);

export function useTask(id: string) {
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState();
  const [task, setTask] = useState<TaskMetadata>();

  const { getTask } = useContext(TaskContext);

  if (!task && !hasFetched && !error) {
    setHasFetched(true);
    getTask(id).then(setTask).catch(setError);
  }

  return task;
}

export function useTaskMutators(id: string) {
  const { changeDescription, changeDone, deleteTask, addSubTask } =
    useContext(TaskContext);

  return {
    changeDescription: (title: string) => changeDescription(id, title),
    changeDone: (isDone: boolean) => changeDone(id, isDone),
    deleteTask: () => deleteTask(id),
    addSubTask: (description: string) => addSubTask(id, description),
  };
}
