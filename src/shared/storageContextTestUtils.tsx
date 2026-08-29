import { ReactElement, ReactNode } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { ContextType, FirebaseContext } from "./FirebaseContext"

export function createStorageContext(
  overrides: Partial<ContextType> = {},
): ContextType {
  return {
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    setValue: jest.fn(),
    useValue: () => ({ value: undefined, loading: false }),
    ...overrides,
  }
}

export function StorageContextWrapper({
  value,
  children,
}: {
  value?: Partial<ContextType>
  children: ReactNode
}) {
  return (
    <FirebaseContext.Provider value={createStorageContext(value)}>
      {children}
    </FirebaseContext.Provider>
  )
}

export function renderWithStorage(
  ui: ReactElement,
  {
    value,
    ...options
  }: { value?: Partial<ContextType> } & Omit<RenderOptions, "wrapper"> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={value}>{children}</StorageContextWrapper>
    ),
    ...options,
  })
}
