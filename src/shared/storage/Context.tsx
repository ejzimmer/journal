import { createContext, useContext } from "react"
import { Task } from "../TaskList/types"

export type FetchTaskContext = {
  getTask: (id: string) => Promise<Task | undefined>
}

export const FetchTask = createContext<FetchTaskContext>({
  getTask: () => Promise.resolve(undefined),
})

export type UpdateTaskContext = {
  onChange: (task: Task) => void
  onDelete: () => void
}
export function useFetchTask(id: string) {
  let context
  try {
    context = useContext(FetchTask)
  } catch (e) {
    throw new Error("Missing fetch task provider")
  }

  return context
}

export const UpdateTask = createContext<UpdateTaskContext>({
  onChange: () => undefined,
  onDelete: () => undefined,
})
export function useUpdateTask(id: string) {
  let context
  try {
    context = useContext(UpdateTask)
  } catch (e) {
    throw new Error("Missing update task provider")
  }

  return context
}
