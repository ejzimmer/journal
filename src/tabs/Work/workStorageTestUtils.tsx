import { ReactElement } from "react"
import { render } from "@testing-library/react"
import { WorkStorageContext, WorkStorageContextType } from "./WorkStorageContext"

export function createWorkStorageContext(
  overrides: Partial<WorkStorageContextType> = {},
): WorkStorageContextType {
  return {
    lists: undefined,
    isLoading: false,
    addList: jest.fn(),
    updateList: jest.fn(),
    deleteList: jest.fn(),
    reorderLists: jest.fn(),
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    reorderTasks: jest.fn(),
    deleteSubtask: jest.fn(),
    updateSubtasksList: jest.fn(),
    getList: () => undefined,
    getTask: () => undefined,
    labels: [],
    getLabel: () => undefined,
    addLabel: jest.fn(),
    removeLabel: jest.fn(),
    updateLabel: jest.fn(),
    ...overrides,
  }
}

export function renderWithWorkStorage(
  ui: ReactElement,
  overrides: Partial<WorkStorageContextType> = {},
) {
  const storageContext = createWorkStorageContext(overrides)
  const result = render(
    <WorkStorageContext.Provider value={storageContext}>
      {ui}
    </WorkStorageContext.Provider>,
  )
  return { ...result, storageContext }
}
