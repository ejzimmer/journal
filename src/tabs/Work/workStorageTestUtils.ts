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
    createLabel: jest.fn((_target, value) => ({ value, colour: "blue" })),
    editLabel: jest.fn(),
    deleteLabel: jest.fn(),
    ...overrides,
  }
}
