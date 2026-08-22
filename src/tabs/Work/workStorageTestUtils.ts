import { WorkStorageContextType } from "./WorkStorageContext"

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
    addSubtask: jest.fn(),
    deleteSubtask: jest.fn(),
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
