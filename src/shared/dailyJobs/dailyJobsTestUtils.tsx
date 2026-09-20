import { ReactNode } from "react"
import { render } from "@testing-library/react"
import { ContextType, FirebaseContext } from "../FirebaseContext"
import { createStorageContext } from "../storageContextTestUtils"
import { DailyJobsProvider } from "./DailyJobsContext"

export function createDailyJobsStorage(
  storedValues: Record<string, unknown> = {},
  overrides: Partial<ContextType> = {},
): ContextType {
  return createStorageContext({
    useValue: <T,>(key?: string) => ({
      value: key ? (storedValues[key] as T) : undefined,
      loading: false,
    }),
    setValue: jest.fn((path: string, value: unknown) => {
      storedValues[path] = value
    }),
    ...overrides,
  })
}

export function renderDailyJobs(jobs: ReactNode, storage: ContextType) {
  return render(
    <FirebaseContext.Provider value={storage}>
      <DailyJobsProvider>{jobs}</DailyJobsProvider>
    </FirebaseContext.Provider>,
  )
}
