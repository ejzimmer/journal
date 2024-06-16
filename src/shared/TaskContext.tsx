import { createContext, useContext, useState } from "react";
import { Task } from "../tabs/Projects/types";

export type TaskContextType = {
  changeDescription: (id: string, title: string) => void;
  changeDone: (id: string, isDone: boolean) => void;
  deleteTask: (id: string) => void;
  getTask: (_id: string) => Promise<Task>;
};

const defaultContext = {
  changeDescription: (_id: string, _title: string) => undefined,
  changeDone: (_id: string, _isDone: boolean) => undefined,
  deleteTask: (_id: string) => undefined,
  getTask: (_id: string) =>
    Promise.resolve({ id: "", description: "", isDone: false }),
};

export const TaskContext = createContext<TaskContextType>(defaultContext);

export function useTask(id: string) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();
  const [task, setTask] = useState<Task>();

  const { getTask, changeDescription, changeDone, deleteTask } =
    useContext(TaskContext);

  if (!task && !isFetching && !error) {
    setIsFetching(true);
    getTask(id)
      .then(setTask)
      .catch(setError)
      .finally(() => setIsFetching(false));
  }

  return {
    task: task ?? { id, description: "", isDone: false },
    changeDescription: (title: string) => changeDescription(id, title),
    changeDone: (isDone: boolean) => changeDone(id, isDone),
    deleteTask: () => deleteTask(id),
  };
}
